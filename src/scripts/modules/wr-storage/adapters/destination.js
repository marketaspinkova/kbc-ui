import Immutable from 'immutable';

const createConfiguration = function(localState) {
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
      mode: localState.get('mode', 'replace')
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    destination: configuration.getIn(['storage', 'input', 'tables', 0, 'destination'], ''),
    mode: configuration.getIn(['parameters', 'mode'], 'replace')
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
