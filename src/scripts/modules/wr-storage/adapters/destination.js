import Immutable from 'immutable';

const createConfiguration = function(localState) {
  const incremental = localState.get('incremental', false);
  const mode = localState.get('mode', incremental ? 'update' : 'replace');
  const config = Immutable.fromJS({
    storage: {
      input: {
        tables: [
          {
            destination: localState.get('destination', '')
          }
        ]
      }
    },
    parameters: {
      mode
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  const incremental = configuration.getIn(['parameters', 'incremental'], false);
  const mode = configuration.getIn(['parameters', 'mode'], incremental ? 'update' : 'replace');

  return Immutable.fromJS({
    destination: configuration.getIn(['storage', 'input', 'tables', 0, 'destination'], ''),
    mode
  });
};

const createEmptyConfiguration = function(tableId) {
  const tableName = tableId.substr(tableId.lastIndexOf('.') + 1);
  return createConfiguration(Immutable.fromJS({ destination: tableName }));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
