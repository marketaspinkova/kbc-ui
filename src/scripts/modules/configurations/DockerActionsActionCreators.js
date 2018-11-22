import dispatcher from '../../Dispatcher';
import * as Constants from './DockerActionsConstants';
import * as ValiditayConstants from './DockerActionsValidityConstants';
import { unhandledRequest } from '../components/DockerActionsApi';
import Store from './DockerActionsStore';
import RoutesStore from '../../stores/RoutesStore';
import { getIndexAutoloadActions } from './utils/settingsHelper';
import ConfigurationsStore from './ConfigurationsStore';

module.exports = {
  callAction: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity, body) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN,
      component: componentId,
      configuration: configurationId,
      configurationVersion: configurationVersion,
      row: rowId,
      rowVersion: rowVersion,
      validity: validity,
      actionName: actionName
    });
    return unhandledRequest(componentId, actionName, body).then(function(response) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS,
        component: componentId,
        configuration: configurationId,
        configurationVersion: configurationVersion,
        row: rowId,
        rowVersion: rowVersion,
        validity: validity,
        actionName: actionName,
        response: response
      });
      return response;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR,
        component: componentId,
        configuration: configurationId,
        configurationVersion: configurationVersion,
        row: rowId,
        rowVersion: rowVersion,
        validity: validity,
        actionName: actionName,
        error: error.response.body.message
      });
      if (error.message !== 'User error') {
        throw error;
      }
    });
  },

  get: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity, body) {
    if (validity !== ValiditayConstants.NO_CACHE && Store.has(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity)) {
      return;
    } else {
      this.callAction(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity, body);
    }
  },

  reloadIndexSyncActions(componentId, configurationId) {
    const settings = RoutesStore.getRouteSettings();
    const actions = getIndexAutoloadActions(settings);
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    actions.forEach((action) => {
      this.get(
        componentId,
        configurationId,
        configuration.get('version'),
        null,
        null,
        action.get('name'),
        action.get('validity'),
        action.get('body')(configuration.get('configuration'))
      );
    });
  }
};
