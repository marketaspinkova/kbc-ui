import React from 'react';
import createReactClass from 'create-react-class';
import RoutesStore from '../../../../../stores/RoutesStore';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import OrchestrationActionCreators from '../../../ActionCreators';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import Notifications from './Notifications';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'notifications');
    const editingValues = OrchestrationStore.getEditingValue(orchestrationId, 'notifications');

    return {
      orchestrationId,
      orchestration,
      notifications: isEditing ? editingValues : orchestration.get('notifications'),
      isEditing,
      filter: OrchestrationStore.getFilter(),
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'notifications'),
      filteredOrchestrations: OrchestrationStore.getFiltered()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-block-with-padding">
            <Notifications
              notifications={this.state.notifications}
              isEditing={this.state.isEditing}
              isSaving={this.state.isSaving}
              onNotificationsChange={this._handleNotificationsChange}
              onSave={this._handleSave}
              onCancel={this._handleCancel}
            />
          </div>
        </div>
      </div>
    );
  },

  _handleNotificationsChange(newNotifications) {
    return OrchestrationActionCreators.updateOrchestrationNotificationsEdit(
      this.state.orchestrationId,
      newNotifications
    );
  },

  _handleSave() {
    return OrchestrationActionCreators.saveOrchestrationNotificationsEdit(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationActionCreators.cancelOrchestrationNotificationsEdit(this.state.orchestrationId);
  }
});
