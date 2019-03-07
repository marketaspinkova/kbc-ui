import Immutable from 'immutable';

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      query: {
        tableName: localState.get('tableName', ''),
        incremental: localState.get('incremental', false),
        primaryKey: localState.get('primaryKey', Immutable.List()).toJS()
      }
    }
  });
};

const parseConfiguration = function(configuration) {
  const query = configuration.getIn(['parameters', 'query'], Immutable.Map());

  return Immutable.fromJS({
    tableName: query.get('tableName', ''),
    incremental: query.get('incremental', false),
    primaryKey: query.get('primaryKey', Immutable.List()).toJS(),
    destinationEditing: true
  });
};

const createEmptyConfiguration = function(name, friendlyName) {
  return createConfiguration(Immutable.fromJS({tableName: friendlyName}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
