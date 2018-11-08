import React from 'react';

// actions and stores
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../../ActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';

// React components
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
      orchestration,
      notifications,
      filter: OrchestrationStore.getFilter(),
      isEditing,
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'notifications'),
      filteredOrchestrations: OrchestrationStore.getFiltered()
    };
  },

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  _handleFilterChange(query) {
    return OrchestrationsActionCreators.setOrchestrationsFilter(query);
  },

  _handleNotificationsChange(newNotifications) {
    return OrchestrationsActionCreators.updateOrchestrationNotificationsEdit(
      this.state.orchestration.get('id'),
      newNotifications
    );
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <Notifications
            notifications={this.state.notifications}
            isEditing={this.state.isEditing}
            onNotificationsChange={this._handleNotificationsChange}
          />
        </div>
      </div>
    );
  }
});
