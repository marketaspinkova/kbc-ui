import dispatcher from '../../Dispatcher';
import * as Constants from './DockerActionsConstants';
import * as ValiditayConstants from './DockerActionsValidityConstants';
import callAction from './DockerActionsApi';
import Store from './stores/DockerActionsStore';
import Promise from 'bluebird';

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
    return callAction(componentId, actionName, body).then(function(response) {
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
        actionName: actionName
      });
      throw error;
    });
  },

  get: function(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity, body) {
    const deferred = Promise.defer();
    const deferredWrapper = Promise.defer();
    deferredWrapper.promise.then(() => {
      if (validity !== ValiditayConstants.NO_CACHE && Store.has(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity)) {
        deferred.resolve(Store.get(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity));
      } else {
        this.callAction(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity, body)
          .then(function() {
            deferred.resolve(Store.get(componentId, configurationId, configurationVersion, rowId, rowVersion, actionName, validity));
          })
          .catch(function(error) {
            if (error.message === 'User error') {
              deferred.reject(error.response.body.message);
            } else {
              throw error;
            }
          });
      }
    });
    deferredWrapper.resolve();
    return deferred.promise;
  }
};
