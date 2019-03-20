import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ApplicationStore from '../../../../../stores/ApplicationStore';

import { States } from './StateConstants';
import WrDbActions from '../../../actionCreators';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import V2Actions from '../../../v2-actions';
import { Loader } from '@keboola/indigo-ui';
import credentialsTemplate from '../../../templates/credentialsFields';
import provisioningTemplates from '../../../templates/provisioning';
import WrDbStore from '../../../store';
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import MissingRedshiftModal from './MissingRedshiftModal';
import CredentialsForm from './CredentialsForm';
import provisioningUtils from '../../../provisioningUtils';

// driver = 'mysql'
// componentId = 'wr-db'
// isProvisioning = true

export default (componentId, driver, isProvisioning) => {
  return createReactClass({
    mixins: [createStoreMixin(InstalledComponentsStore, WrDbStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const credentials = WrDbStore.getCredentials(componentId, configId);
      const isEditing = !!WrDbStore.getEditingByPath(componentId, configId, 'creds');
      let editingCredentials = null;
      if (isEditing) {
        editingCredentials = WrDbStore.getEditingByPath(componentId, configId, 'creds');
      }
      const isSaving = !!WrDbStore.getSavingCredentials(componentId, configId);

      const provisioningCredentials = WrDbStore.getProvisioningCredentials(componentId, configId);
      const isLoadingProvCredentials = WrDbStore.isLoadingProvCredentials(componentId, configId);
      const localState = InstalledComponentsStore.getLocalState(componentId, configId);
      const v2Actions = V2Actions(configId, componentId);

      return {
        localState,
        provisioningCredentials,
        credentials,
        configId,
        editingCredentials,
        isEditing,
        isSaving,
        loadingProvisioning: isLoadingProvCredentials,
        v2Actions
      };
    },

    componentDidMount() {
      const state = this.state.localState.get('credentialsState');
      // ignore setting state in some cases
      if ([States.SAVING_NEW_CREDS, States.PREPARING_PROV_WRITE, States.CREATE_NEW_CREDS].includes(state)) {
        return;
      }
      if (isProvisioning === false) {
        this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
        return;
      }
      if (this._hasDbConnection(this.state.credentials)) {
        return this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
      } else {
        return this._updateLocalState('credentialsState', States.INIT);
      }
    },

    render() {
      if (isProvisioning) {
        return this._renderWithProvisioning();
      } else {
        return this._renderNoProvisioning();
      }
    },

    _renderMissingRedshiftModal() {
      return (
        <MissingRedshiftModal
          show={this.state.localState.get('showMissingRedshift', false)}
          onHideFn={() => {
            return this._updateLocalState('showMissingRedshift', false);
          }}
        />
      );
    },

    _renderNoProvisioning() {
      let { credentials } = this.state;
      const state = this.state.localState.get('credentialsState');
      let isEditing = false;
      if ([States.SAVING_NEW_CREDS, States.CREATE_NEW_CREDS, States.INIT].includes(state)) {
        isEditing = true;
        credentials = this.state.editingCredentials;
      }
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            {this._renderMissingRedshiftModal()}
            {this._renderCredentialsForm(credentials, isEditing)}
          </div>
        </div>
      );
    },

    _renderWithProvisioning() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            {this._renderMissingRedshiftModal()}
            {this._renderBaseOnState()}
          </div>
        </div>
      );
    },

    _renderInit() {
      const driverName = provisioningTemplates[driver].name;
      return (
        <div>
          <div className="kbc-header kbc-row">
            <div className="kbc-title">
              <h2>Choose which database to use</h2>
            </div>
          </div>
          <div
            className="table table-hover"
            style={{
              marginTop: '-1px'
            }}
          >
            <div className="tbody">
              <a className="tr" onClick={this._toggleCreateOwnCredentials}>
                <span className="td">
                  <h4 className="list-group-item-heading">{`Own ${driverName} database`}</h4>
                  <p className="list-group-item-text">
                    {`User has their own ${driverName} database and will provide its credentials`}
                  </p>
                </span>
              </a>
              <a className="tr" onClick={this._toggleCreateProvWriteCredentials}>
                <span className="td">
                  <h4 className="list-group-item-heading">{`Keboola ${driverName} database`}</h4>
                  <p className="list-group-item-text">
                    {`Keboola will provide and set up a dedicated ${driverName} database. Any ${driverName} database previously provided for this configuration will be dropped.`}
                  </p>
                </span>
              </a>
            </div>
          </div>
        </div>
      );
    },

    _renderBaseOnState() {
      const state = this.state.localState.get('credentialsState');

      switch (state) {
        case States.INIT:
          return this._renderInit();

        case States.PREPARING_PROV_WRITE:
          return (
            <div className="well">
              Preparing provisioning credentials <Loader />
            </div>
          );

        case States.SHOW_STORED_CREDS:
          return this._renderCredentialsForm(this.state.credentials, false);

        case States.CREATE_NEW_CREDS:
          return this._renderCredentialsForm(this.state.editingCredentials, true);

        case States.SAVING_NEW_CREDS:
          return this._renderCredentialsForm(this.state.editingCredentials, true);

        default:
          return null;
      }
    },

    _toggleCreateOwnCredentials() {
      let credentials = this.state.credentials.map((value, key) => {
        if (['database', 'db', 'host', 'hostname', 'password', 'schema', 'user'].includes(key)) {
          return '';
        } else {
          return value;
        }
      });
      const defaultPort = this._getDefaultPort();
      credentials = credentials.set('port', defaultPort);
      credentials = credentials.set('driver', driver);
      credentials = credentials.delete('password');
      WrDbActions.setEditingData(componentId, this.state.configId, 'creds', credentials);
      return this._updateLocalState('credentialsState', States.CREATE_NEW_CREDS);
    },

    _toggleCreateProvWriteCredentials() {
      const hasRedshift = ApplicationStore.getSapiToken().getIn(['owner', 'hasRedshift']);
      if (!hasRedshift && driver === 'redshift') {
        return this._updateLocalState('showMissingRedshift', true);
      }
      this._updateLocalState('credentialsState', States.PREPARING_PROV_WRITE);
      const isReadOnly = false;
      return WrDbActions.loadProvisioningCredentials(componentId, this.state.configId, isReadOnly, driver).then(() => {
        return this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
      });
    },

    _getDefaultPort() {
      const fields = credentialsTemplate(componentId);
      for (let field of fields) {
        if (field[1] === 'port') {
          return field[4];
        }
      }
      return '';
    },

    _renderCredentialsForm(credentials, isEditing) {
      const state = this.state.localState.get('credentialsState');
      const isSaving = state === States.SAVING_NEW_CREDS;
      const isProvisioningProp = this._isProvCredentials();
      return (
        <CredentialsForm
          savedCredentials={this.state.credentials}
          isEditing={isEditing}
          credentials={credentials}
          onChangeFn={this._handleChange}
          changeCredentialsFn={this.setCredentials}
          isSaving={isSaving}
          isProvisioning={!isEditing && isProvisioningProp}
          componentId={componentId}
          configId={this.state.configId}
          driver={driver}
          testCredentialsFn={c => {
            return this.state.v2Actions.testCredentials(c);
          }}
        />
      );
    },

    _isProvCredentials() {
      return provisioningUtils.isProvisioningCredentials(driver, this.state.credentials);
    },

    _handleChange(propName, event) {
      let value;
      if (['port', 'retries'].indexOf(propName) >= 0) {
        value = parseInt(event.target.value, 10);
      } else {
        ({ value } = event.target);
      }
      value = value.toString();
      const creds = this.state.editingCredentials.set(propName, value);
      return this.setCredentials(creds);
    },

    setCredentials(creds) {
      return WrDbActions.setEditingData(componentId, this.state.configId, 'creds', creds);
    },

    _hasDbConnection(dbCredentials) {
      let credentials = dbCredentials ? dbCredentials.toJS() : null;

      if (!credentials) {
        return false;
      }

      return !(
        _.isEmpty(credentials.host) ||
        _.isEmpty(credentials.database) ||
        _.isEmpty(credentials.user) ||
        credentials.port === 'NaN'
      );
    },

    _updateLocalState(pathname, data) {
      const path = _.isString(pathname) ? [pathname] : pathname;
      const newLocalState = this.state.localState.setIn(path, data);
      return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
    }
  });
};
