import Immutable from 'immutable';
import {DatasetLocations} from "./../helpers/constants";

export default {
  createConfiguration: function(localState) {
    return Immutable.fromJS({
      parameters: {
        google: {
          storage: localState.get('storage', ''),
          location: localState.get('location', DatasetLocations.MULTI_REGION_US)
        }
      }
    });
  },

  parseConfiguration: function(configuration) {
    return Immutable.fromJS({
      storage: configuration.getIn(['parameters', 'google', 'storage'], ''),
      location: configuration.getIn(['parameters', 'google', 'location'], DatasetLocations.MULTI_REGION_US)
    });
  },

  isComplete: function(configuration) {
    return configuration.getIn(['parameters', 'google', 'storage'], '') !== '';
  }
};
