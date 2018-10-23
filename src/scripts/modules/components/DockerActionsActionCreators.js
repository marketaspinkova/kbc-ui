import dispatcher from '../../Dispatcher';
import * as Constants from './DockerActionsConstants';
import callAction from './DockerActionsApi';

module.exports = {
  callAction: function(componentId, action, body) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN,
      component: componentId,
      action: action
    });
    return callAction(componentId, action, body).then(function(response) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS,
        component: componentId,
        action: action,
        response: response
      });
      return response;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR,
        component: componentId,
        action: action
      });
      throw error;
    });
  }
};
