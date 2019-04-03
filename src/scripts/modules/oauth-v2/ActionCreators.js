import dispatcher from '../../Dispatcher';
import Promise from 'bluebird';
import oauthStore from './Store';
import oauthApi from './Api';
import * as Constants from './Constants';
import Immutable from 'immutable';

export default {
  loadCredentials(componentId, id, version) {
    if (oauthStore.hasCredentials(componentId, id)) {
      return Promise.resolve();
    }
    return this.loadCredentialsForce(componentId, id, version);
  },

  loadCredentialsForce(componentId, id, version) {
    return oauthApi
      .getCredentials(componentId, id, version)
      .then(function(result) {
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_LOAD_CREDENTIALS_SUCCESS,
          componentId,
          id,
          credentials: Immutable.fromJS(result)
        });
        return result;
      })
      .catch(() => {
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_LOAD_CREDENTIALS_ERROR,
          componentId,
          id
        });
      });
  },

  postCredentials(componentId, id, authorizedFor, data) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.OAUTHV2_POST_CREDENTIALS_START,
      componentId,
      id
    });

    return oauthApi
      .postCredentials(componentId, id, authorizedFor, data)
      .then(result =>
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_POST_CREDENTIALS_SUCCESS,
          componentId,
          id,
          credentials: Immutable.fromJS(result)
        })
      )
      .catch(() => {
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_API_ERROR,
          componentId,
          id
        });
      });
  },

  deleteCredentials(componentId, id, version) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.OAUTHV2_DELETE_CREDENTIALS_START,
      componentId,
      id
    });

    return oauthApi
      .deleteCredentials(componentId, id, version)
      .then(result =>
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_DELETE_CREDENTIALS_SUCCESS,
          componentId,
          id,
          credentials: result
        })
      )
      .catch(() => {
        dispatcher.handleViewAction({
          type: Constants.ActionTypes.OAUTHV2_API_ERROR,
          componentId,
          id
        });
      });
  }
};
