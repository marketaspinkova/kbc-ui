import StoreUtils from '../../../utils/StoreUtils';
import Immutable from 'immutable';
import * as constants from '../DockerActionsConstants';
import dispatcher from '../../../Dispatcher';

var _store = Immutable.Map({
  pendingActions: Immutable.Map()
});

var DockerActionsStore = StoreUtils.createStore({
  getPendingActions: function(componentId) {
    return _store.getIn(['pendingActions', componentId], Immutable.List());
  }
});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {
    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN:
      _store = _store.setIn(
        ['pendingActions', action.component, action.action],
        true
      );
      return DockerActionsStore.emitChange();
    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS:
    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR:
      _store = _store.deleteIn(
        ['pendingActions', action.component, action.action]
      );
      return DockerActionsStore.emitChange();
    default:
  }
});

module.exports = DockerActionsStore;
