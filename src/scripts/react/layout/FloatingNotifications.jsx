import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../mixins/createStoreMixin';
import NotificationsStore from '../../stores/NotificationsStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import Notification from './Notification';

export default createReactClass({
  mixins: [createStoreMixin(NotificationsStore)],

  getStateFromStores() {
    return {
      notifications: NotificationsStore.getNotifications()
    };
  },

  render() {
    return (
      <div className="kbc-notifications">
        {this.state.notifications.map((notification) => {
          return (
            <Notification
              key={notification.get('id')}
              notification={notification}
              onCancel={this.handleCancel}
              onMouseEnter={this.handleEnter}
              onMouseLeave={this.handleLeave}
            />
          );
        })}
      </div>
    );
  },

  handleEnter(id) {
    ApplicationActionCreators.pauseNotificationAging(id);
  },

  handleLeave(id) {
    ApplicationActionCreators.resetNotificationAging(id);
  },

  handleCancel(id) {
    ApplicationActionCreators.deleteNotification(id, true);
  }

});
