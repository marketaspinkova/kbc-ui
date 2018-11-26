import React from 'react';
import { Map, fromJS, List } from 'immutable';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import MySqlSandboxCredentialsStore from '../../../provisioning/stores/MySqlSandboxCredentialsStore';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';
import MySqlCredentials from '../../../provisioning/react/components/MySqlCredentials';
import ConfigureSandbox from './ConfigureSandbox';
import ConnectToMySqlSandbox from '../components/ConnectToMySqlSandbox';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteButton from '../../../../react/common/DeleteButton';
import StorageBucketsStore from '../../../components/stores/StorageBucketsStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import Tooltip from './../../../../react/common/Tooltip';
import MySqlSSLInfoModal from './MySqlSSLInfoModal';
import ExtendMySqlCredentials from '../../../provisioning/react/components/ExtendMySqlCredentials';

export default React.createClass({
  mixins: [createStoreMixin(MySqlSandboxCredentialsStore, StorageTablesStore, StorageBucketsStore)],

  getInitialState() {
    return {
      showSSLInfoModal: false,
      sandboxConfiguration: Map()
    };
  },

  getStateFromStores() {
    return {
      credentials: MySqlSandboxCredentialsStore.getCredentials(),
      validUntil: MySqlSandboxCredentialsStore.getValidUntil(),
      pendingActions: MySqlSandboxCredentialsStore.getPendingActions(),
      isLoading: MySqlSandboxCredentialsStore.getIsLoading(),
      isLoaded: MySqlSandboxCredentialsStore.getIsLoaded(),
      tables: StorageTablesStore.getAll(),
      buckets: StorageBucketsStore.getAll()
    };
  },

  _renderCredentials() {
    return (
      <span>
        <MySqlCredentials
          credentials={this.state.credentials}
          validUntil={this.state.validUntil}
          isCreating={this.state.pendingActions.get('create')}
        />
      </span>
    );
  },

  _renderControlButtons() {
    if (this.state.credentials.get('id')) {
      return (
        <div>
          <div>
            <RunComponentButton
              title="Load tables into MySQL sandbox"
              component="transformation"
              method="create-sandbox"
              mode="button"
              label="Load data"
              disabled={this.state.pendingActions.size > 0}
              runParams={() => this.state.sandboxConfiguration.toJS()}
              modalOnHide={() => {
                this.setState({
                  sandboxConfiguration: Map()
                });
              }}
              modalRunButtonDisabled={this.state.sandboxConfiguration.get('include', List()).size === 0}
            >
              <ConfigureSandbox
                backend="mysql"
                tables={this.state.tables}
                buckets={this.state.buckets}
                onChange={params => {
                  this.setState({
                    sandboxConfiguration: fromJS(params)
                  });
                }}
              />
            </RunComponentButton>
          </div>
          <div>
            <ConnectToMySqlSandbox credentials={this.state.credentials}>
              <button
                className="btn btn-link"
                title="Connect To Sandbox"
                type="submit"
                disabled={this.state.pendingActions.size > 0}
              >
                <span className="fa fa-fw fa-database" />
                {' Connect'}
              </button>
            </ConnectToMySqlSandbox>
          </div>
          <div>
            <Tooltip tooltip="Information about secure connection" id="ssl" placement="top">
              <button
                className="btn btn-link"
                onClick={this._showSSLInfoModal}
                disabled={this.state.pendingActions.size > 0}
              >
                <span className="fa fa-fw fa-lock " />
                {' SSL'}
              </button>
            </Tooltip>
            <MySqlSSLInfoModal show={this.state.showSSLInfoModal} onHide={this._hideSSLInfoModal} />
          </div>
          <div>
            <DeleteButton
              label="Drop sandbox"
              tooltip="Delete MySQL Sandbox"
              isPending={this.state.pendingActions.get('drop')}
              fixedWidth={true}
              isEnabled={this.state.pendingActions.size === 0}
              pendingLabel="Deleting sandbox"
              confirm={{
                title: 'Delete MySQL Sandbox',
                text: 'Do you really want to delete the MySQL sandbox?',
                onConfirm: this._dropCredentials
              }}
            />
          </div>
          <div>
            <ExtendMySqlCredentials />
          </div>
        </div>
      );
    }

    if (!this.state.pendingActions.get('create')) {
      return (
        <button className="btn btn-link" onClick={this._createCredentials}>
          <i className="fa fa-fw fa-plus" />New Sandbox
        </button>
      );
    }
  },

  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <h4>
            MySQL
          </h4>
        </div>
        <div className="col-md-9">{this._renderCredentials()}</div>
        <div className="col-md-3">{this._renderControlButtons()}</div>
      </div>
    );
  },

  _createCredentials() {
    return CredentialsActionCreators.createMySqlSandboxCredentials();
  },

  _dropCredentials() {
    return CredentialsActionCreators.dropMySqlSandboxCredentials();
  },

  _showSSLInfoModal() {
    return this.setState({ showSSLInfoModal: true });
  },

  _hideSSLInfoModal() {
    return this.setState({ showSSLInfoModal: false });
  }
});
