import React from 'react';
import RoutesStore from '../../../../../stores/RoutesStore';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import OrchestrationActionCreators from '../../../ActionCreators';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import Notifications from './Notifications';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getStateFromStores() {
    let notifications;
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'notifications');

    if (isEditing) {
      notifications = OrchestrationStore.getEditingValue(orchestrationId, 'notifications');
    } else {
      notifications = orchestration.get('notifications');
    }

    return {
      orchestrationId,
      orchestration,
      notifications,
      filter: OrchestrationStore.getFilter(),
      isEditing: OrchestrationStore.isEditing(orchestrationId, 'notifications'),
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
