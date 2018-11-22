import dispatcher from '../../Dispatcher';
import * as Constants from './DockerActionsConstants';
import * as ValiditayConstants from './DockerActionsValidityConstants';
import { unhandledRequest } from '../components/DockerActionsApi';
import Store from './DockerActionsStore';
import RoutesStore from '../../stores/RoutesStore';
import ConfigurationsStore from './ConfigurationsStore';
import ConfigurationRowsStore from './ConfigurationRowsStore';
import Immutable from 'immutable';

module.exports = {
  callAction: function(componentId, configurationId, configurationVersion, rowId, actionName, validity, body) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN,
      component: componentId,
      configuration: configurationId,
      configurationVersion: configurationVersion,
      row: rowId,
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
        validity: validity,
        actionName: actionName,
        error: error.response.body.message
      });
      if (error.message !== 'User error') {
        throw error;
      }
    });
  },

  get: function(componentId, configurationId, configurationVersion, rowId, actionName, validity, body) {
    if (body === false) {
      return;
    }
    if (validity !== ValiditayConstants.NO_CACHE && Store.has(componentId, configurationId, configurationVersion, rowId, actionName)) {
      return;
    } else {
      this.callAction(componentId, configurationId, configurationVersion, rowId, actionName, validity, body);
    }
  },

  reloadIndexSyncActions(componentId, configurationId) {
    const settings = RoutesStore.getRouteSettings();
    const actions = settings.getIn(['index', 'actions'], Immutable.List()).filter(actionItem => {
      return actionItem.get('autoload', false) === true;
    });
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    actions.forEach((action) => {
      this.get(
        componentId,
        configurationId,
        configuration.get('version'),
        null,
        action.get('name'),
        action.get('validity'),
        action.get('body')(configuration.get('configuration'))
      );
    });
  },

  reloadRowSyncActions(componentId, configurationId, rowId) {
    const settings = RoutesStore.getRouteSettings();
    const actions = settings.getIn(['row', 'actions'], Immutable.List()).filter(actionItem => {
      return actionItem.get('autoload', false) === true;
    });
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    const row = ConfigurationRowsStore.get(componentId, configurationId, rowId);
    actions.forEach((action) => {
      this.get(
        componentId,
        configurationId,
        configuration.get('version'),
        rowId,
        action.get('name'),
        action.get('validity'),
        action.get('body')(configuration.get('configuration'), row.get('configuration'))
      );
    });
  }
};
