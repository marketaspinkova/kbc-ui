import Immutable from 'immutable';

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      path: localState.get('path', ''),
      onlyNewFiles: localState.get('onlyNewFiles', '')
    }
  });
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    path: configuration.getIn(['parameters', 'path'], ''),
    onlyNewFiles: configuration.getIn(['parameters', 'onlyNewFiles'], '')
  });
};

const createEmptyConfiguration = function() {
  return createConfiguration(Immutable.fromJS({onlyNewFiles: false}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
