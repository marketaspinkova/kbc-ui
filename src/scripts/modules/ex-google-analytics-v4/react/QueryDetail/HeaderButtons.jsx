import React from 'react';

import createReactClass from 'create-react-class';

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

    mixins: [createStoreMixin(...storeMixins)],

    componentWillReceiveProps() {
      this.setState(this.getStateFromStores());
    },

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteParam('queryId');
      const store = storeProvisioning(configId, componentId);
      const actions = actionsProvisioning(configId, componentId);
      const editingQuery = store.getEditingQuery(queryId);
      return {
        queryId: queryId,
        editingQuery: editingQuery,
        isEditing: !!editingQuery,
        store: store,
        actions: actions
      };
    },

    render() {
      const {actions} = this.state;
      return (
        <EditButtons
          isEditing={this.state.isEditing}
          isSaving={this.state.store.isSavingQuery(this.state.queryId)}
          isDisabled={!this.state.store.isQueryValid(this.state.editingQuery)}
          onCancel={ () => actions.cancelEditingQuery(this.state.queryId)}
          onSave={ () => actions.saveEditingQuery(this.state.queryId)}
          onEditStart={ () => actions.startEditingQuery(this.state.queryId)}/>
      );
    }
  });
}
