import React from 'react';
import { Map } from 'immutable';
import Select from 'react-select';
import {FormControl} from 'react-bootstrap';
import RoutesStore from '../../../../../stores/RoutesStore';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import OrchestrationActionCreators from '../../../ActionCreators';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import EditButtons from '../../../../../react/common/EditButtons';


export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  // componentWillReceiveProps() {
  //   return this.setState(this.getStateFromStores());
  // },

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
    const errorEmails = this._getNotificationsForChannel('error');
    const warningEmails = this._getNotificationsForChannel('warning');
    const processingEmails = this._getNotificationsForChannel('processing');

    return (
      <div className="kbc-block-with-padding">
        <EditButtons
          isEditing={this.state.isEditing}
          isSaving={this.state.isSaving}
          editLabel="Edit Notifications"
          onCancel={this._handleCancel}
          onSave={this._handleSave}
          onEditStart={this._handleStart}
        />
        <div>
          <p>
            {'Subscribe to receive notifications on some of the orchestration job '}
            events that might require your attention.
          </p>
        </div>
        <div>
          <h2>Errors</h2>
          <p>Get notified when the orchestration finishes with an error.</p>
          {this._renderNotificationsEditor('error', errorEmails)}
          <h2>Warnings</h2>
          <p>Get notified when the orchestration finishes with a warning.</p>
          {this._renderNotificationsEditor('warning', warningEmails)}
        </div>
        <div>
          <h2>Processing</h2>
          <p>Get notified when a job is processing {this._renderToleranceInput()} % longer than usual.</p>
          {this._renderNotificationsEditor('processing', processingEmails)}
        </div>
      </div>
    );
  },

  _renderToleranceInput() {
    return (
      <FormControl
        type="number"
        value={this._getTolerance()}
        onChange={this._onToleranceChange}
        style={{
          width: '80px',
          display: 'inline-block'
        }}
      />
    );
  },

  _renderNotificationsEditor(channelName, emails) {
    return (
      <Select.Creatable
        multi={true}
        backspaceRemoves={false}
        deleteRemoves={false}
        value={this._enteredEmails(emails)}
        noResultsText=""
        placeholder="Enter email"
        promptTextCreator={() => 'Add email'}
        onChange={newEmails => this._onChannelChange(channelName, newEmails)}
      />
    );
  },

  _enteredEmails(emails) {
    return emails
      .map(email => ({
        value: email.get('email'),
        label: email.get('email')
      }))
      .toArray();
  },

  _onChannelChange(channelName, newEmails) {
    const tolerance = this._getTolerance();
    let newNotifications = newEmails.map(email =>
      Map({
        email: email.value,
        channel: channelName,
        parameters: Map(channelName === 'processing' ? { tolerance } : {})
      })
    );

    newNotifications = this.state.notifications
      .filter(notification => notification.get('channel') !== channelName)
      .concat(newNotifications);

    return this._handleNotificationsChange(newNotifications);
  },

  _onToleranceChange(e) {
    const tolerance = parseInt(e.target.value, 10);
    const newNotifications = this.state.notifications.map(notification => {
      if (notification.get('channel') !== 'processing') {
        return notification;
      } else {
        return notification.setIn(['parameters', 'tolerance'], tolerance);
      }
    });
    return this._handleNotificationsChange(newNotifications);
  },

  _getTolerance() {
    const notifications = this._getNotificationsForChannel('processing').filter(notification =>
      notification.hasIn(['parameters', 'tolerance'])
    );

    if (!notifications.count()) {
      return 20;
    } else {
      return notifications.first().getIn(['parameters', 'tolerance']);
    }
  },

  _getNotificationsForChannel(channelName) {
    return this.state.notifications.filter(notification => notification.get('channel') === channelName);
  },

  _handleFilterChange(query) {
    return OrchestrationActionCreators.setOrchestrationsFilter(query);
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
  },

  _handleStart() {
    return OrchestrationActionCreators.startOrchestrationNotificationsEdit(this.state.orchestrationId);
  }

});
