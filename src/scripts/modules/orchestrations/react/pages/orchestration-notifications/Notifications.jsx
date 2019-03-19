import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import Select from 'react-select';
import {Col, ControlLabel, Form, FormControl, FormGroup, HelpBlock} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';

export default createReactClass({
  propTypes: {
    notifications: PropTypes.object.isRequired, // notifications in structure from API
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onNotificationsChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  },

  render() {
    const errorEmails = this._getNotificationsForChannel('error');
    const warningEmails = this._getNotificationsForChannel('warning');
    const processingEmails = this._getNotificationsForChannel('processing');

    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={12}>
            <ConfirmButtons
              isSaving={this.props.isSaving}
              onCancel={this.props.onCancel}
              onSave={this.props.onSave}
              isDisabled={!this.props.isEditing}
              showCancel={this.props.isEditing}
              className="text-right"
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={12}>
            <p>
              Subscribe to receive notifications on some of the orchestration job events that might require your
              attention.
            </p>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Errors
          </Col>
          <Col sm={10}>
            {this._renderNotificationsEditor('error', errorEmails)}
            <HelpBlock>
              Get notified when the orchestration finishes with an error.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Warnings
          </Col>
          <Col sm={10}>
            {this._renderNotificationsEditor('warning', warningEmails)}
            <HelpBlock>
              Get notified when the orchestration finishes with a warning.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Processing
          </Col>
          <Col sm={10}>
            {this._renderNotificationsEditor('processing', processingEmails)}
            <HelpBlock>
              Get notified when a job is processing {this._renderToleranceInput()} % longer than usual.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  },

  _renderToleranceInput() {
    const notificationsCount = this._getNotificationsForChannel('processing').filter(notification =>
      notification.hasIn(['parameters', 'tolerance'])
    ).count();
    return (
      <FormControl
        type="number"
        min="1"
        max="100"
        value={this._getTolerance()}
        onChange={this._onToleranceChange}
        disabled={!notificationsCount}
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
        options={this.getAllEnteredEmails()}
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

  getAllEnteredEmails() {
    return this.props.notifications
      .reduce((emails, item) => {
        return emails.push(item.get('email'));
      }, List())
      .toSet()
      .map(email => ({
        value: email,
        label: email
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
