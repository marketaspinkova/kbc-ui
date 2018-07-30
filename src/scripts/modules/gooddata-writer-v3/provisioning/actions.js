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
        data
      }),
      err => dispatcher.handleViewAction({
        type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR,
        error: err
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
  }
};
