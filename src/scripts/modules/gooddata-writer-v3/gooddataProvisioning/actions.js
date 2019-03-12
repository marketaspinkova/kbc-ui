import {ProvisioningActionTypes} from '../constants';
import dispatcher from '../../../Dispatcher';
import * as utils from './utils';
import api from './api';
import HttpError from '../../../utils/errors/HttpError';

function handleError(error) {
  if (error.response) {
    throw new HttpError(error.response);
  } else {
    throw error;
  }
}

export default {
  loadProvisioningData(pid) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_START,
      pid
    });
    return utils.loadProvisioningData(pid).then(
      data => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_SUCCESS,
        data,
        pid
      })).catch(err => {
      dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR,
        error: err,
        pid
      });
      handleError(err);
    });
  },

  loadNewProjectProvisioningData(pid) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_START,
      pid
    });
    return utils.loadNewProjectProvisioningData(pid).then(
      data => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_SUCCESS,
        data,
        pid
      })).catch(err => {
      dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR,
        error: err,
        pid
      });
      handleError(err);
    });
  },

  deleteProject(pid) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_DELETE_START,
      pid
    });
    return api.deleteProject(pid).then(
      () => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_DELETE_SUCCESS,
        pid
      })).catch(err => {
      dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_DELETE_ERROR,
        error: err,
        pid
      });
      handleError(err);
    });
  },

  createProject(name, tokenType, customToken) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_START
    });
    const token = utils.isCustomToken(tokenType) ? customToken : tokenType;
    return api.createProjectAndUser(name, token).then(
      data => {
        data.token = token;
        dispatcher.handleViewAction({
          type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_SUCCESS,
          data
        });
        return data;
      }).catch(err => {
      dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_ERROR,
        error: err
      });
      handleError(err);
    }
    );
  }
};
