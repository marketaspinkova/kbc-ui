import React from 'react';
import { Map } from 'immutable';

// actions and stores
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../../ActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';

// React components
import OrchestrationsNav from './../orchestration-detail/OrchestrationsNav';
import { SearchBar } from '@keboola/indigo-ui';
import Notifications from './Notifications';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getInitialState() {
    return {
      inputs: Map({
        error: '',
        warning: '',
        processing: '',
        waiting: ''
      })
    };
  },

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

  _handleInputChange(channelName, newValue) {
    return this.setState({
      inputs: this.state.inputs.set(channelName, newValue)
    });
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="row kbc-row-orchestration-detail">
            <div className="col-md-3 kb-orchestrations-sidebar kbc-main-nav">
              <div className="kbc-container">
                <div className="layout-master-detail-search">
                  <SearchBar onChange={this._handleFilterChange} query={this.state.filter} />
                </div>
                <OrchestrationsNav
                  orchestrations={this.state.filteredOrchestrations}
                  activeOrchestrationId={this.state.orchestration.get('id')}
                />
              </div>
            </div>
            <div className="col-md-9 kb-orchestrations-main kbc-main-content-with-nav">
              <Notifications
                notifications={this.state.notifications}
                inputs={this.state.inputs}
                isEditing={this.state.isEditing}
                onNotificationsChange={this._handleNotificationsChange}
                onInputChange={this._handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
});
