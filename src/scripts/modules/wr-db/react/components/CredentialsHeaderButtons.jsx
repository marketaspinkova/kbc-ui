import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import WrDbStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import ActionCreators from '../../actionCreators';
import { Navigation } from 'react-router';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import { States } from '../pages/credentials/StateConstants';
import SaveButtons from '../../../../react/common/SaveButtons';
import credentialsUtils from '../../credentialsUtils';

export default (componentId, driver, isProvisioning) => {
  return createReactClass({
    mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore), Navigation],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const currentCredentials = WrDbStore.getCredentials(componentId, configId);
      const editingCredentials = WrDbStore.getEditingByPath(componentId, configId, 'creds');
      const localState = InstalledComponentsStore.getLocalState(componentId, configId);
      const credsState = localState.get('credentialsState');
      const isEditing = !credentialsUtils
        .defaultCredentials(componentId, driver, currentCredentials)
        .equals(editingCredentials);

      // state
      return {
        editingCredsValid: credentialsUtils.hasDbConnection(componentId, editingCredentials),
        currentCredentials,
        configId,
        isEditing,
        isSaving: credsState === States.SAVING_NEW_CREDS,
        localState
      };
    },

    _handleResetSelection() {
      ActionCreators.resetProvisioning(componentId, this.state.configId, driver);
      ActionCreators.resetCredentials(componentId, this.state.configId);
      return this._updateLocalState('credentialsState', States.INIT);
    },

    _handleReset() {
      const credentials = credentialsUtils.defaultCredentials(componentId, driver, this.state.currentCredentials);
      ActionCreators.setEditingData(componentId, this.state.configId, 'creds', credentials);
    },

    _handleSave() {
      this._updateLocalState('credentialsState', States.SAVING_NEW_CREDS);
      let editingCredentials = WrDbStore.getEditingByPath(componentId, this.state.configId, 'creds');
      editingCredentials = editingCredentials.map((value, key) => {
        const isHashed = key[0] === '#';
        if (isHashed && _.isEmpty(value)) {
          return this.state.currentCredentials.get(key);
        } else {
          return value;
        }
      });

      return ActionCreators.saveCredentials(componentId, this.state.configId, editingCredentials).then(() => {
        this._updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
        return RoutesStore.getRouter().transitionTo(componentId, { config: this.state.configId });
      });
    },

    _updateLocalState(newPath, data) {
      const path = _.isString(newPath) ? [newPath] : newPath;
      const newLocalState = this.state.localState.setIn(path, data);
      return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
    },

    render() {
      const state = this.state.localState.get('credentialsState');

      if ([States.SHOW_STORED_CREDS].includes(state)) {
        return (
          <div>
            {isProvisioning && (
              <button className="btn btn-link" onClick={this._handleResetSelection}>
                <span className="fa fa-fw fa-times" />
                {' Reset Credentials'}
              </button>
            )}
          </div>
        );
      }

      if ([States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS].includes(state)) {
        return (
          <SaveButtons
            isSaving={this.state.isSaving}
            isChanged={this.state.isEditing}
            disabled={this.state.isSaving || !this.state.editingCredsValid}
            onReset={this._handleReset}
            onSave={this._handleSave}
          />
        );
      }

      return null;
    }
  });
};
