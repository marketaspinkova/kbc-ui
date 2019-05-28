import StoreUtils, { initStore } from '../../utils/StoreUtils';
import Immutable from 'immutable';
import * as constants from './DockerActionsConstants';
import dispatcher from '../../Dispatcher';

var _store = initStore('DockerActionsStore', Immutable.Map({
  actions: Immutable.Map()
}));

function constructActionPath(componentId, actionName, cacheId) {
  return ['actions', componentId, actionName, cacheId];
}

function getCacheId(action, configuration, row) {
  const body = action.get('getPayload')(configuration, row);
  if (!body) {
    return null;
  }
  return body.hashCode();
}

var DockerActionsStore = StoreUtils.createStore({
  has: function(componentId, action, configuration, row) {
    const cacheId = getCacheId(action, configuration, row);
    return _store.hasIn(constructActionPath(componentId, action.get('name'), cacheId));
  },

  get: function(componentId, action, configuration, row) {
    const cacheId = getCacheId(action, configuration, row);
    const path = constructActionPath(componentId, action.get('name'), cacheId);
    if (_store.hasIn(path)) {
      return _store.getIn(path);
    }
    return Immutable.fromJS({
      status: 'none'
    });
  }
});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;
  const actionPath = constructActionPath(
    action.component,
    action.actionName,
    action.cacheId
  );
  switch (action.type) {
    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'pending'
      }));
      DockerActionsStore.emitChange();
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'success',
        data: action.response,
        request: action.requestBody
      }));
      DockerActionsStore.emitChange();
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'error',
        error: action.error
      }));
      DockerActionsStore.emitChange();
      break;

    default:
      break;
  }
});

export default DockerActionsStore;
