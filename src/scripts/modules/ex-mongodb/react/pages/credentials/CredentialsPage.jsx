import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import routesStore from '../../../../../stores/RoutesStore';

import SaveButtons from '../../../../../react/common/SaveButtons';


import CredentialsForm from './CredentialsForm';

export default function(componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return createReactClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    getStateFromStores() {
      const config = routesStore.getCurrentRouteParam('config');
      const dbStore = storeProvisioning.createStore(componentId, config);
      const editingCredentials = dbStore.getEditingCredentials();
      const isEditing = dbStore.isEditingCredentials();
      const credentials = dbStore.getCredentials();
      return {
        configId: config,
        credentials: credentials,
        isEditing: isEditing,
        editingCredentials: editingCredentials,
        isSaving: dbStore.isSavingCredentials(),
        isChangedCredentials: dbStore.isChangedCredentials(),
        isValidCredentials: isEditing ? dbStore.hasValidCredentials(editingCredentials) : dbStore.hasValidCredentials(credentials)
      };
    },

    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="kbc-inner-padding text-right">
              <SaveButtons
                isSaving={this.state.isSaving}
                isChanged={this.state.isChangedCredentials}
                disabled={this.state.isSaving || !this.state.isValidCredentials}
                onReset={this.handleReset}
                onSave={this.handleSave}
              />
            </div>
            <CredentialsForm
              isValidEditingCredentials={this.state.isValidCredentials}
              credentials={(this.state.isEditing) ? this.state.editingCredentials : this.state.credentials}
              savedCredentials={this.state.credentials}
              enabled={!this.state.isSaving}
              isEditing={this.state.isEditing}
              onChange={this.handleChange}
              componentId={componentId}
              configId={this.state.configId}
              credentialsTemplate={credentialsTemplate}
              hasSshTunnel={hasSshTunnel}
              actionCreators={actionCreators}
            />
          </div>
        </div>
      );
    },

    handleChange(newCredentials) {
      actionCreators.updateEditingCredentials(this.state.configId, newCredentials);
    },

    handleReset() {
      actionCreators.cancelCredentialsEdit(this.state.configId);
    },

    handleSave() {
      actionCreators.saveCredentialsEdit(this.state.configId);
    }
  });
}
