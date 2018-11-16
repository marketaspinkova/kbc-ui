Dispatcher = require('../Dispatcher')
Immutable = require('immutable')
{Map, List} = Immutable
Constants = require '../constants/KbcConstants'
StoreUtils = require '../utils/StoreUtils'

_store = Map
  notifications: List()

hasNotificationWithId = (id) ->
  return false if !id
  found = _store.get('notifications').find (notification) ->
    notification.get('id') == id
  !! found

NotificationsStore = StoreUtils.createStore

  getNotifications: ->
    _store.get 'notifications'

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when Constants.ActionTypes.APPLICATION_SET_PAUSE_NOTIFICATION
      paused = action.paused
      id = action.notificationId
      _store = _store
        .update 'notifications', (notifications) ->
          notifications.map( (notf) ->
            notf.set('paused', paused).set('created', new Date())
          )
      NotificationsStore.emitChange()

    when Constants.ActionTypes.APPLICATION_SEND_NOTIFICATION

      # avoid duplication of same message
      if !hasNotificationWithId(action.notification.id)
        _store = _store
          .update 'notifications', (notifications) ->
            notifications.unshift Map(action.notification)
        NotificationsStore.emitChange()

    when Constants.ActionTypes.APPLICATION_DELETE_NOTIFICATION
      forceDelete = action.forceDelete
      index = _store.get('notifications').findIndex (notification) ->
        notification.get('id') == action.notificationId
      if index >= 0
        isPaused = _store.get('notifications').get(index).get('paused')
        if not isPaused or forceDelete
          _store = _store.update 'notifications', (notifications) ->
            notifications.delete index
          NotificationsStore.emitChange()

    when Constants.ActionTypes.ROUTER_ROUTE_CHANGE_SUCCESS
      _store = _store
        .update 'notifications', (notifications) ->
          notifications.map( (notf) ->
            notf.set('paused', false)
          )
      NotificationsStore.emitChange()

module.exports = NotificationsStore
