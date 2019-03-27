import dispatcher from '../../Dispatcher';
import constants from './Constants';

export default {
  receive(servicesRaw) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.SERVICES_LOAD_SUCCESS,
      services: servicesRaw
    });
  }
};
