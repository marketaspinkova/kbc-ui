import Immutable from 'immutable';

const createConfiguration = function(localState) {
  if (!localState.get('project') && !localState.get('dataset')) {
    return Immutable.fromJS({});
  }
  const config = Immutable.fromJS({
    parameters: {
      project: localState.get('project', ''),
      dataset: localState.get('dataset', '')
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    project: configuration.getIn(['parameters', 'project'], ''),
    dataset: configuration.getIn(['parameters', 'dataset'], '')
  });
};

const isComplete = function(configuration) {
  if (configuration.getIn(['parameters', 'project'], '') === '') {
    return false;
  }
  if (configuration.getIn(['parameters', 'dataset'], '') === '') {
    return false;
  }
  return true;
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  isComplete: isComplete
};
