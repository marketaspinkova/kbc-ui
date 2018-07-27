import {ProvisioningActionTypes} from './store';
import dispatcher from '../../../Dispatcher';
import utils from './utils';

export default {
  loadProvisioningData(pid) {
    dispatcher.handleViewAction({
      type: ProvisioningActionTypes.GD_PROVISIONING_LOAD_START,
      pid
    });
    return utils.loadProvisioningData(pid).then(
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
    return utils.prepareProject(name, tokenType, customToken).then(
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
