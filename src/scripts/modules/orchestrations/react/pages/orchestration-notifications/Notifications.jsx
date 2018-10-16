import React from 'react';
import { Map } from 'immutable';
import SubscribersList from './SubscribersList';
import Select from 'react-select';
import { FormControl } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    notifications: React.PropTypes.object.isRequired, // notifications in structure from API
    isEditing: React.PropTypes.bool.isRequired,
    onNotificationsChange: React.PropTypes.func.isRequired
  },

  render() {
    const errorEmails = this._getNotificationsForChannel('error');
    const warningEmails = this._getNotificationsForChannel('warning');
    const processingEmails = this._getNotificationsForChannel('processing');

    return (
      <div className="kbc-block-with-padding">
        <div>
          <p>
            {'Subscribe to receive notifications on some of the orchestration job '}
            events that might require your attention.
          </p>
        </div>
        <div>
          <h2>Errors</h2>
          <p>Get notified when the orchestration finishes with an error.</p>
          {this.props.isEditing ? (
            this._renderNotificationsEditor('error', errorEmails)
          ) : (
            <SubscribersList emails={errorEmails} />
          )}
          <h2>Warnings</h2>
          <p>Get notified when the orchestration finishes with a warning.</p>
          {this.props.isEditing ? (
            this._renderNotificationsEditor('warning', warningEmails)
          ) : (
            <SubscribersList emails={warningEmails} />
          )}
        </div>
        <div>
          <h2>Processing</h2>
          {this.props.isEditing && processingEmails.count() ? (
            <p>
              {'Get notified when a job is processing '}
              {this._renderToleranceInput()}
              {' % longer than usual.'}
            </p>
          ) : (
            <p>
              {'Get notified when a job is processing '}
              {this._getTolerance()}% longer than usual.
            </p>
          )}
          {this.props.isEditing ? (
            this._renderNotificationsEditor('processing', processingEmails)
          ) : (
            <SubscribersList emails={processingEmails} />
          )}
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
        placeholder="Enter email ..."
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

    newNotifications = this.props.notifications
      .filter(notification => notification.get('channel') !== channelName)
      .concat(newNotifications);

    return this.props.onNotificationsChange(newNotifications);
  },

  _onToleranceChange(e) {
    const tolerance = parseInt(e.target.value, 10);
    const newNotifications = this.props.notifications.map(notification => {
      if (notification.get('channel') !== 'processing') {
        return notification;
      } else {
        return notification.setIn(['parameters', 'tolerance'], tolerance);
      }
    });
    return this.props.onNotificationsChange(newNotifications);
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
    return this.props.notifications.filter(notification => notification.get('channel') === channelName);
  }
});
