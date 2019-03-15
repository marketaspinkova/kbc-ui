import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JupyterSandboxCredentialsStore from '../../../provisioning/stores/JupyterSandboxCredentialsStore';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';
import JupyterCredentials from '../../../provisioning/react/components/JupyterCredentials';
import DeleteButton from '../../../../react/common/DeleteButton';
import StorageBucketsStore from '../../../components/stores/StorageBucketsStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import CreateDockerSandboxModal from '../modals/CreateDockerSandboxModal';
import ExtendJupyterCredentials from '../../../provisioning/react/components/ExtendJupyterCredentials';

var JupyterSandbox = createReactClass({
  mixins: [createStoreMixin(JupyterSandboxCredentialsStore, StorageBucketsStore, StorageTablesStore)],
  displayName: 'JupyterSandbox',
  getStateFromStores: function() {
    return {
      credentials: JupyterSandboxCredentialsStore.getCredentials(),
      validUntil: JupyterSandboxCredentialsStore.getValidUntil(),
      pendingActions: JupyterSandboxCredentialsStore.getPendingActions(),
      isLoading: JupyterSandboxCredentialsStore.getIsLoading(),
      isLoaded: JupyterSandboxCredentialsStore.getIsLoaded(),
      tables: StorageTablesStore.getAll(),
      buckets: StorageBucketsStore.getAll()
    };
  },
  getInitialState() {
    return {
      showModal: false,
      sandboxConfiguration: Immutable.Map()
    };
  },
  _renderCredentials: function() {
    return (
      <span>
        <JupyterCredentials
          credentials={this.state.credentials}
          validUntil={this.state.validUntil}
          isCreating={this.state.pendingActions.get('create')}
        />
      </span>
    );
  },
  _renderControlButtons: function() {
    if (this.state.credentials.get('id')) {
      return (
        <div>
          <div>
            <form action={this._connectLink(this.state.credentials)} target="_blank">
              <button
                type="submit"
                className="btn btn-link"
                disabled={this.state.pendingActions.size > 0}
              >
                <span className="fa fa-fw fa-database" />&nbsp;Connect
              </button>
            </form>
            <div>
              <DeleteButton
                tooltip="Delete Jupyter Sandbox"
                isPending={this.state.pendingActions.get('drop')}
                pendingLabel="Deleting sandbox"
                isEnabled={this.state.pendingActions.size === 0}
                label="Drop sandbox"
                fixedWidth={true}
                confirm={{
                  title: 'Delete Jupyter Sandbox',
                  text: 'Do you really want to delete the Jupyter sandbox?',
                  onConfirm: this._dropCredentials
                }}
              />
            </div>
            <div>
              <ExtendJupyterCredentials />
            </div>
          </div>
        </div>
      );
    } else if (!this.state.pendingActions.get('create')) {
      return (
        <span>
          <CreateDockerSandboxModal
            show={this.state.showModal}
            close={this.handleClose}
            create={this._createCredentials}
            tables={this.tablesList()}
            type="Jupyter"
            onConfigurationChange={this.onConfigurationChange}
            disabled={this.state.sandboxConfiguration.getIn(['input', 'tables'], Immutable.List()).size === 0}
          />
          <button className="btn btn-link" onClick={this.openModal}>
            <i className="fa fa-fw fa-plus" />
            New Sandbox
          </button>
        </span>
      );
    }
  },

  _connectLink(credentials) {
    return (
      (credentials.get('hasHttps') ? 'https://' : 'http://') +
      credentials.get('hostname') +
      ':' +
      credentials.get('port') +
      '/notebooks/notebook.ipynb'
    );
  },

  render: function() {
    return (
      <div className="kbc-row">
        <h4>
          Jupyter{' '}
          <span className="label label-info">
            <a
              style={{color: '#fff'}}
              href="http://status.keboola.com/call-for-testers-rstudio-and-jupyter-sandboxes"
            >
              BETA
            </a>
          </span>
        </h4>
        <div className="row">
          <div className="col-md-9">{this._renderCredentials()}</div>
          <div className="col-md-3">{this._renderControlButtons()}</div>
        </div>
      </div>
    );
  },
  _createCredentials: function() {
    return CredentialsActionCreators.createJupyterSandboxCredentials(this.state.sandboxConfiguration.toJS());
  },
  _dropCredentials: function() {
    return CredentialsActionCreators.dropJupyterSandboxCredentials();
  },
  handleClose() {
    this.setState({
      showModal: false,
      sandboxConfiguration: Immutable.Map()
    });
  },
  openModal() {
    this.setState({ showModal: true });
  },
  onConfigurationChange(configuration) {
    this.setState({ sandboxConfiguration: Immutable.fromJS(configuration) });
  },
  tablesList() {
    return this.state.tables
      .map(function(table) {
        return table.get('id');
      })
      .toList();
  }
});

export default JupyterSandbox;
