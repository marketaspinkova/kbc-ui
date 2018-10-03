import {Map, fromJS} from 'immutable';
export default {
  createConfiguration(localState) {
    return fromJS({parameters: {dimensions: localState.get('dimensions')}});
  },

  parseConfiguration(configuration) {
    const dimensions = configuration.getIn(['parameters', 'dimensions'], Map());
    return Map({
      dimensions: dimensions
    });
  }
};
