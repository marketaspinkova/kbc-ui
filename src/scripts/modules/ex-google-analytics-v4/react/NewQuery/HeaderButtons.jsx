import React from 'react';
import createReactClass from 'create-react-class';
import {Navigation} from 'react-router';

// stores
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import RoutesStore from '../../../../stores/RoutesStore';

// actions
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import EditButtons from '../../../../react/common/EditButtons';

export default function(componentId) {
  return createReactClass({

    mixins: [createStoreMixin(...storeMixins), Navigation],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const store = storeProvisioning(configId, componentId);
      const actions = actionsProvisioning(configId, componentId);
      const newQuery = store.getNewQuery();

      return {
        configId: configId,
        newQuery: newQuery,
        store: store,
        actions: actions
      };
    },

    render() {
      return (
        <EditButtons
          isEditing={true}
          isSaving={this.state.store.isSaving('newQuery')}
          isDisabled={!this.state.store.isQueryValid(this.state.newQuery)}
          onCancel={this.redirectToIndex}
          onSave={this.save}
          onEditStart={() => {}}
        />
      );
    },

    redirectToIndex() {
      this.transitionTo(componentId, {config: this.state.configId});
      this.state.actions.resetNewQuerySampleDataInfo();
      return this.state.actions.cancelEditingNewQuery();
    },

    save() {
      return this.state.actions.saveNewQuery().then( () => {
        return this.redirectToIndex();
      });
    }
  });
}
