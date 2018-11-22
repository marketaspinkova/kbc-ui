import StoreUtils from '../../utils/StoreUtils';
import Immutable from 'immutable';
import * as constants from './DockerActionsConstants';
import dispatcher from '../../Dispatcher';
import validityConstants from './DockerActionsValidityConstants';

var _store = Immutable.Map({
  actions: Immutable.Map()
});

function constructActionPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
  let path = ['actions', componentId, configurationId];
  switch (validity) {
    case validityConstants.CONFIGURATION:
      path.push(...[null, null, null]);
      break;
    case validityConstants.CONFIGURATION_VERSION:
      path.push(...[configurationVersion, null, null]);
      break;
    case validityConstants.ROW:
      path.push(...[configurationVersion, rowId, null]);
      break;
    case validityConstants.ROW_VERSION:
    case validityConstants.NO_CACHE:
      path.push(...[configurationVersion, rowId, rowVersion]);
      break;
    default:
      break;
  }
  path.push(actionName);
  return path;
}

var DockerActionsStore = StoreUtils.createStore({
  has: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
    return _store.hasIn(constructActionPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity));
  },

  get: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
    const path = constructActionPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity);
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
    action.rowVersion,
    action.actionName,
    action.validity
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
