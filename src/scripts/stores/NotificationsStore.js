import Dispatcher from '../Dispatcher';
import { Map, List } from 'immutable';
import * as Constants from '../constants/KbcConstants';
import StoreUtils, { initStore } from '../utils/StoreUtils';

let _store = initStore('NotificationsStore', Map({
  notifications: List()
}));

const hasNotificationWithId = id => {
  if (!id) {
    return false;
  }
  const found = _store.get('notifications').find(notification => notification.get('id') === id);
  return !!found;
};

const NotificationsStore = StoreUtils.createStore({
  getNotifications() {
    return _store.get('notifications');
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.APPLICATION_SET_PAUSE_NOTIFICATION:
      _store = _store.update('notifications', notifications =>
        notifications.map(notf => notf.set('paused', action.paused).set('created', new Date()))
      );
      return NotificationsStore.emitChange();

    case Constants.ActionTypes.APPLICATION_SEND_NOTIFICATION:
      // avoid duplication of same message
      if (!hasNotificationWithId(action.notification.id)) {
        _store = _store.update('notifications', notifications => notifications.unshift(Map(action.notification)));
        return NotificationsStore.emitChange();
      }
      break;

    case Constants.ActionTypes.APPLICATION_DELETE_NOTIFICATION:
      const index = _store
        .get('notifications')
        .findIndex(notification => notification.get('id') === action.notificationId);

      if (index >= 0) {
        const isPaused = _store
          .get('notifications')
          .get(index)
          .get('paused');

        if (!isPaused || action.forceDelete) {
          _store = _store.update('notifications', notifications => notifications.delete(index));
          return NotificationsStore.emitChange();
        }
      }
      break;

    case Constants.ActionTypes.ROUTER_ROUTE_CHANGE_SUCCESS:
      _store = _store
        .update('notifications', notifications =>
          notifications.map( notf => notf.set('paused', false))
        );
      return NotificationsStore.emitChange();

    default:
      break;
  }
});

export default NotificationsStore;
