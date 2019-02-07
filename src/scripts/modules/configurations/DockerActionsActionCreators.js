import dispatcher from '../../Dispatcher';
import * as Constants from './DockerActionsConstants';
import { unhandledRequest } from '../components/DockerActionsApi';
import Store from './DockerActionsStore';
import RoutesStore from '../../stores/RoutesStore';
import ConfigurationsStore from './ConfigurationsStore';
import ConfigurationRowsStore from './ConfigurationRowsStore';
import Immutable from 'immutable';

export default {
  callAction: function(componentId, actionName, body, cache) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN,
      component: componentId,
      cache: cache,
      cacheId: body.hashCode(),
      actionName: actionName,
      requestBody: body
    });
    return unhandledRequest(componentId, actionName, body).then(function(response) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS,
        component: componentId,
        cache: cache,
        cacheId: body.hashCode(),
        actionName: actionName,
        response: response,
        requestBody: body
      });
      return response;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR,
        component: componentId,
        cache: cache,
        cacheId: body.hashCode(),
        actionName: actionName,
        error: error.response.body.message,
        requestBody: body
      });
      if (error.message !== 'User error') {
        throw error;
      }
    });
  },

  requestAction: function(componentId, action, configuration, row) {
    const body = action.get('getPayload')(configuration, row);
    if (body === false) {
      return;
    }
    if (action.get('cache') === true && Store.has(componentId, action, configuration, row)) {
      return;
    } else {
      this.callAction(componentId, action.get('name'), body, action.get('cache', false));
      return;
    }
  },

  reloadIndexSyncActions(componentId, configurationId) {
    const settings = RoutesStore.getRouteSettings();
    const actions = settings.getIn(['index', 'actions'], Immutable.List()).filter(actionItem => {
      return actionItem.get('autoload', false) === true;
    });
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    actions.forEach((action) => {
      this.requestAction(
        componentId,
        action,
        configuration.get('configuration')
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
      this.requestAction(
        componentId,
        action,
        configuration.get('configuration'),
        row.get('configuration')
      );
    });
  }
};
