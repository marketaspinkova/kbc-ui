import Immutable from 'immutable';
import {DatasetLocations} from "./../constants";

export default {
  createConfiguration: function(localState) {
    const config = Immutable.fromJS({
      parameters: {
        google: {
          storage: localState.get('storage', ''),
          'location': localState.get('location', 'US')
        }
      }
    });
    return config;
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
