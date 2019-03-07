import Immutable from 'immutable';

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      tableName: localState.get('tableName', ''),
      query: {
        incremental: localState.get('incremental', false),
        primaryKey: localState.get('primaryKey', Immutable.List()).toJS()
      }
    }
  });
};

const parseConfiguration = function(configuration) {
  const query = configuration.getIn(['parameters', 'query'], Immutable.Map());

  return Immutable.fromJS({
    tableName: configuration.getIn(['parameters', 'tableName'], ''),
    incremental: query.get('incremental', false),
    primaryKey: query.get('primaryKey', Immutable.List()).toJS(),
    destinationEditing: true
  });
};

const createEmptyConfiguration = function(name) {
  return createConfiguration(Immutable.fromJS({tableName: name}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
