import dispatcher from '../Dispatcher';
import * as constants from '../constants/KbcConstants';
import _ from 'underscore';

export default {
  receiveApplicationData(data) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.APPLICATION_DATA_RECEIVED,
      applicationData: data
    });
  },

  /*
    notification -
      text - (required) notification message string or React element
      type - notification type, default is success
      id - notification id, used for duplicate messages filter
  */
  sendNotification(newNotification) {
    const timeout = 10000;
    const defaults = {
      pause: false,
      message: '',
      type: 'success',
      id: _.uniqueId('notification'),
      created: new Date(),
      timeout
    };

    if (!newNotification.id) {
      delete newNotification.id;
    }

    const notification = _.extend(defaults, newNotification);

    dispatcher.handleViewAction({
      type: constants.ActionTypes.APPLICATION_SEND_NOTIFICATION,
      notification
    });

    return setTimeout(this.deleteNotification.bind(this, notification.id), timeout);
  },

  deleteNotification(id, forceDelete) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.APPLICATION_DELETE_NOTIFICATION,
      notificationId: id,
      forceDelete
    });
  },

  pauseNotificationAging(id) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.APPLICATION_SET_PAUSE_NOTIFICATION,
      notificationId: id,
      paused: true
    });
  },

  resetNotificationAging(id) {
    const timeout = 10000;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.APPLICATION_SET_PAUSE_NOTIFICATION,
      notificationId: id,
      paused: false
    });
    return setTimeout(this.deleteNotification.bind(this, id), timeout);
  }
};
