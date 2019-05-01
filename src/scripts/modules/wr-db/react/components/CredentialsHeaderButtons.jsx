import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import WrDbStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import ActionCreators from '../../actionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import { Loader } from '@keboola/indigo-ui';
import { States } from '../pages/credentials/StateConstants';
import credentialsTemplates from '../../templates/credentialsFields';
import provisioningUtils from '../../provisioningUtils';

export default (componentId, driver, isProvisioning) => {
  return createReactClass({
    mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const currentCredentials = WrDbStore.getCredentials(componentId, configId);
      const localState = InstalledComponentsStore.getLocalState(componentId, configId);
      const credsState = localState.get('credentialsState');
      const isEditing = !!WrDbStore.getEditingByPath(componentId, configId, 'creds');
      const isProvisionedCreds = provisioningUtils.isProvisioningCredentials(driver, currentCredentials);
      const editingCredentials = WrDbStore.getEditingByPath(componentId, configId, 'creds');

      // state
      return {
        editingCredsValid: this._hasDbConnection(editingCredentials),
        currentCredentials,
        currentConfigId: configId,
        isEditing: !!WrDbStore.getEditingByPath(componentId, configId, 'creds'),
        isSaving: credsState === States.SAVING_NEW_CREDS,
        localState,
        isProvisionedCreds: !isEditing && isProvisionedCreds
      };
    },

    _handleEditStart() {
      let creds = this.state.currentCredentials;
      creds = creds ? creds.set('driver', driver) : null;
      creds = this._getDefaultValues(creds);
      creds = creds.map((value, key) => {
        const isHashed = key[0] === '#';
        return isHashed ? '' : value;
      });
      // ActionCreators.resetCredentials componentId, @state.currentConfigId
      ActionCreators.setEditingData(componentId, this.state.currentConfigId, 'creds', creds);
      return this._updateLocalState('credentialsState', States.CREATE_NEW_CREDS);
    },

    _handleResetStart() {
      return this._updateLocalState('credentialsState', States.INIT);
    },

    _handleCancel() {
      if (this.state.isProvisionedCreds) {
        return this._updateLocalState('credentialsState', States.INIT);
      } else {
        ActionCreators.setEditingData(componentId, this.state.currentConfigId, 'creds', null);
        return this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
      }
    },

    _handleCreate() {
      this._updateLocalState('credentialsState', States.SAVING_NEW_CREDS);
      let editingCredentials = WrDbStore.getEditingByPath(componentId, this.state.currentConfigId, 'creds');
      editingCredentials = editingCredentials.map((value, key) => {
        const isHashed = key[0] === '#';
        if (isHashed && _.isEmpty(value)) {
          return this.state.currentCredentials.get(key);
        } else {
          return value;
        }
      });
      return ActionCreators.saveCredentials(componentId, this.state.currentConfigId, editingCredentials).then(() => {
        this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
        return RoutesStore.getRouter().transitionTo(componentId, { config: this.state.currentConfigId });
      });
    },

    render() {
      const state = this.state.localState.get('credentialsState');

      if ([States.SHOW_STORED_CREDS].includes(state)) {
        return (
          <div>
            {isProvisioning && (
              <button className="btn btn-link" disabled={this.state.isSaving} onClick={this._handleResetStart}>
                <span className="fa fa-fw fa-times" />
                {' Reset Credentials'}
              </button>
            )}
            {!this.state.isProvisionedCreds && (
              <button className="btn btn-success" disabled={this.state.isSaving} onClick={this._handleEditStart}>
                <span className="fa fa-edit" />
                {' Edit Credentials'}
              </button>
            )}
          </div>
        );
      }

      if ([States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS].includes(state)) {
        return (
          <div>
            {this.state.isSaving && <Loader />}
            <button className="btn btn-link" disabled={this.state.isSaving} onClick={this._handleCancel}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              disabled={this.state.isSaving || !this.state.editingCredsValid}
              onClick={this._handleCreate}
            >
              Save
            </button>
          </div>
        );
      } else {
        return null;
      }
    },

    _updateLocalState(newPath, data) {
      const path = _.isString(newPath) ? [newPath] : newPath;
      const newLocalState = this.state.localState.setIn(path, data);
      return InstalledComponentsActions.updateLocalState(componentId, this.state.currentConfigId, newLocalState, path);
    },

    _hasDbConnection(credentials) {
      const fields = credentialsTemplates(componentId);
      const result = _.reduce(
        fields,
        (memo, field) => {
          const propName = field[1];
          const isHashed = propName[0] === '#';
          const isRequired = field[6];
          return memo && (!isRequired || !!credentials.get(propName) || isHashed);
        },
        !!credentials
      );
      return result;
    },

    _getDefaultPort() {
      const fields = credentialsTemplates(componentId);
      for (let field of fields) {
        if (field[1] === 'port') {
          return field[4];
        }
      }
      return '';
    },

    _getDefaultValues(defaultCredentials) {
      let credentials = defaultCredentials;
      const fields = credentialsTemplates(componentId);
      for (let field of fields) {
        if (!!field[4]) {
          credentials = credentials ? credentials.set(field[1], credentials.get(field[1], field[4])) : null;
        }
      }

      return credentials;
    }
  });
};
