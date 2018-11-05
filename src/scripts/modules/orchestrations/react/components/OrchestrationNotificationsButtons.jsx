import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import OrchestrationsActionCreators from '../../ActionCreators';
import EditButtons from '../../../../react/common/EditButtons';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');

    return {
      orchestrationId,
      isEditing: OrchestrationsStore.isEditing(orchestrationId, 'notifications'),
      isSaving: OrchestrationsStore.isSaving(orchestrationId, 'notifications')
    };
  },

  _handleSave() {
    return OrchestrationsActionCreators.saveOrchestrationNotificationsEdit(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationNotificationsEdit(this.state.orchestrationId);
  },

  _handleStart() {
    return OrchestrationsActionCreators.startOrchestrationNotificationsEdit(this.state.orchestrationId);
  },

  render() {
    return (
      <EditButtons
        isEditing={this.state.isEditing}
        isSaving={this.state.isSaving}
        editLabel="Edit Notifications"
        onCancel={this._handleCancel}
        onSave={this._handleSave}
        onEditStart={this._handleStart}
      />
    );
  }
});
