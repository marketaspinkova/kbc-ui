import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import OrchestrationsActionCreators from '../../ActionCreators';
import EditButtons from '../../../../react/common/EditButtons';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');

    return {
      orchestrationId,
      isEditing: OrchestrationsStore.isEditing(orchestrationId, 'tasks'),
      isSaving: OrchestrationsStore.isSaving(orchestrationId, 'tasks')
    };
  },

  _handleSave() {
    return OrchestrationsActionCreators.saveOrchestrationTasks(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationTasksEdit(this.state.orchestrationId);
  },

  _handleStart() {
    return OrchestrationsActionCreators.startOrchestrationTasksEdit(this.state.orchestrationId);
  },

  render() {
    return (
      <EditButtons
        isEditing={this.state.isEditing}
        isSaving={this.state.isSaving}
        editLabel="Edit Tasks"
        onCancel={this._handleCancel}
        onSave={this._handleSave}
        onEditStart={this._handleStart}
      />
    );
  }
});
