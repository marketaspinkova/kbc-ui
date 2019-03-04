import Immutable from 'immutable';

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      query: {
        name: localState.get('name', ''),
        query: localState.get('query', ''),
        useLegacySql: localState.get('useLegacySql', true)
      }
    }
  });
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    name: configuration.getIn(['parameters', 'query', 'name'], configuration.get('name', '')),
    query: configuration.getIn(['parameters', 'query', 'query'], ''),
    useLegacySql: configuration.getIn(['parameters', 'query', 'useLegacySql'], true)
  });
};

const createEmptyConfiguration = function(tableId) {
  return createConfiguration(Immutable.fromJS({name: tableId}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
