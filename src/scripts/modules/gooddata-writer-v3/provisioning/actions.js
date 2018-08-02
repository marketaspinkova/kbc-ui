import {ProvisioningActionTypes} from '../helpers/Constants';
import dispatcher from '../../../Dispatcher';
import {isCustomToken, loadProvisioningData} from './utils';
import api from './api';

export default {
  loadProvisioningData(pid) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_START,
      pid
    });
    return loadProvisioningData(pid).then(
      data => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_SUCCESS,
        data,
        pid
      }),
      err => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR,
        error: err,
        pid
      })
    );
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
      }),
      err => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_DELETE_ERROR,
        error: err,
        pid
      })
    );
  },

  createProject(name, tokenType, customToken) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_START
    });
    const token = isCustomToken(tokenType) ? customToken : tokenType;
    return api.createProjectAndUser(name, token).then(
      data => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_SUCCESS,
        data
      }),
      err => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_CREATE_ERROR,
        error: err
      })
    );
  },

  toggleProjectAccess(pid, enable) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_START,
      pid
    });
    const apiPromise = enable ? api.enableSSOAccess(pid) : api.disableSSOAccess(pid);
    return apiPromise.then(
      data => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_SUCCESS,
        pid,
        enable,
        data
      }),
      err => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_ERROR,
        pid,
        error: err
      })
    );
  }
};
