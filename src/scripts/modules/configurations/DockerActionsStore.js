import StoreUtils from '../../utils/StoreUtils';
import Immutable from 'immutable';
import * as constants from './DockerActionsConstants';
import dispatcher from '../../Dispatcher';

var _store = Immutable.Map({
  actions: Immutable.Map()
});

function constructActionPath(componentId, configurationId, configurationVersion, rowId, actionName) {
  return ['actions', componentId, configurationId, configurationVersion, rowId, actionName];
}

var DockerActionsStore = StoreUtils.createStore({
  has: function(componentId, configurationId, configurationVersion, rowId, actionName) {
    return _store.hasIn(constructActionPath(componentId, configurationId, configurationVersion, rowId, actionName));
  },

  get: function(componentId, configurationId, configurationVersion, rowId, actionName) {
    const path = constructActionPath(componentId, configurationId, configurationVersion, rowId, actionName);
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
    action.configuration,
    action.configurationVersion,
    action.row,
    action.actionName
  );
  switch (action.type) {
    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'pending'
      }));
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'success',
        data: action.response
      }));
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR:
      _store = _store.setIn(actionPath, Immutable.fromJS({
        status: 'error',
        error: action.error
      }));
      break;

    default:
      break;
  }
  DockerActionsStore.emitChange();
});

module.exports = DockerActionsStore;
