import React from 'react';
import Immutable from 'immutable';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RedshiftSandboxCredentialsStore from '../../../provisioning/stores/RedshiftSandboxCredentialsStore';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';
import RedshiftCredentials from '../../../provisioning/react/components/RedshiftCredentials';
import ConfigureSandbox from './ConfigureSandbox';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteButton from '../../../../react/common/DeleteButton';
import StorageBucketsStore from '../../../components/stores/StorageBucketsStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import contactSupport from '../../../../utils/contactSupport';
import Tooltip from './../../../../react/common/Tooltip';
import RedshiftSSLInfoModal from './RedshiftSSLInfoModal';

export default React.createClass({
  mixins: [createStoreMixin(RedshiftSandboxCredentialsStore, StorageBucketsStore, StorageTablesStore)],

  getStateFromStores() {
    return {
      credentials: RedshiftSandboxCredentialsStore.getCredentials(),
      pendingActions: RedshiftSandboxCredentialsStore.getPendingActions(),
      isLoading: RedshiftSandboxCredentialsStore.getIsLoading(),
      isLoaded: RedshiftSandboxCredentialsStore.getIsLoaded(),
      tables: StorageTablesStore.getAll(),
      buckets: StorageBucketsStore.getAll()
    };
  },

  getInitialState() {
    return {
      showSSLInfoModal: false,
      sandboxConfiguration: Immutable.Map()
    };
  },

  _openSupportModal(e) {
    contactSupport({ type: 'project' });
    e.preventDefault();
    e.stopPropagation();
  },

  _renderCredentials() {
    return (
      <span>
        <RedshiftCredentials
          credentials={this.state.credentials}
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
              component="transformation"
              method="create-sandbox"
              title="Load tables into Redshift sandbox"
              mode="button"
              label="Load data"
              disabled={this.state.pendingActions.size > 0}
              runParams={() => this.state.sandboxConfiguration}
              modalOnHide={() => {
                this.setState({
                  sandboxConfiguration: Immutable.Map()
                });
              }}
              modalRunButtonDisabled={this.state.sandboxConfiguration.get('include', Immutable.List()).size === 0}
            >
              <ConfigureSandbox
                backend="redshift"
                tables={this.state.tables}
                buckets={this.state.buckets}
                onChange={params => {
                  this.setState({
                    sandboxConfiguration: Immutable.fromJS(params)
                  });
                }}
              />
            </RunComponentButton>
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
            <RedshiftSSLInfoModal show={this.state.showSSLInfoModal} onHide={this._hideSSLInfoModal} />
          </div>
          <div>
            <DeleteButton
              tooltip="Delete Redshift Sandbox"
              isPending={this.state.pendingActions.size > 0}
              isEnabled={this.state.pendingActions.size === 0}
              pendingLabel="Deleting sandbox"
              label="Drop sandbox"
              fixedWidth={true}
              confirm={{
                title: 'Delete Redshift Sandbox',
                text: 'Do you really want to delete the Redshift sandbox?',
                onConfirm: this._dropCredentials
              }}
            />
          </div>
        </div>
      );
    } else if (!this.state.pendingActions.get('create')) {
      return (
        <button className="btn btn-link" onClick={this._createCredentials}>
          <i className="fa fa-fw fa-plus" />
            New Sandbox
        </button>
      );
    }
  },

  render() {
    return (
      <div className="kbc-row">
        <h4>
          Redshift
        </h4>
        <div className="row">
          <div className="col-md-9">{this._renderCredentials()}</div>
          <div className="col-md-3">{this._renderControlButtons()}</div>
        </div>
      </div>
    );
  },

  _createCredentials() {
    CredentialsActionCreators.createRedshiftSandboxCredentials();
  },

  _dropCredentials() {
    CredentialsActionCreators.dropRedshiftSandboxCredentials();
  },

  _showSSLInfoModal() {
    this.setState({ showSSLInfoModal: true });
  },

  _hideSSLInfoModal() {
    this.setState({ showSSLInfoModal: false });
  }
});
