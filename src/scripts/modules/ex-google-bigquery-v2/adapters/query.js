import Immutable from 'immutable';

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      query: {
        query: localState.get('query', ''),
        useLegacySql: localState.get('useLegacySql', true)
      }
    }
  });
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    query: configuration.getIn(['parameters', 'query', 'query'], ''),
    useLegacySql: configuration.getIn(['parameters', 'query', 'useLegacySql'], true)
  });
};

const createEmptyConfiguration = function() {
  return createConfiguration(Immutable.fromJS({}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
