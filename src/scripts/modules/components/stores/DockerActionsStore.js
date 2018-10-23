import StoreUtils from '../../../utils/StoreUtils';
import Immutable from 'immutable';
import * as constants from '../DockerActionsConstants';
import dispatcher from '../../../Dispatcher';
import validityConstants from '../DockerActionsValidityConstants';

var _store = Immutable.Map({
  pendingActions: Immutable.Map(),
  responses: Immutable.Map()
});

function constructResponsesPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
  let path = ['responses', componentId, configurationId];
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
  getPendingActions: function(componentId) {
    return _store.getIn(['pendingActions', componentId], Immutable.List());
  },

  has: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
    return _store.hasIn(constructResponsesPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity));
  },

  get: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity) {
    const path = constructResponsesPath(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity);
    return _store.getIn(path, Immutable.Map());
  }
});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;
  const responseSavePath = constructResponsesPath(
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
      _store = _store.setIn(
        ['pendingActions', action.component, action.actionName],
        true
      );
      _store = _store.deleteIn(responseSavePath);
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS:
      _store = _store.deleteIn(
        ['pendingActions', action.component, action.actionName]
      );
      _store = _store.setIn(responseSavePath, Immutable.fromJS(action.response));
      break;

    case constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR:
      _store = _store.deleteIn(
        ['pendingActions', action.component, action.actionName]
      );
      break;

    default:
      break;
  }
  DockerActionsStore.emitChange();
});

module.exports = DockerActionsStore;
