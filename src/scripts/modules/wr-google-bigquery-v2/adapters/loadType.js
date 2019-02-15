import Immutable from 'immutable';

const createConfiguration = function(localState) {
  const config = Immutable.fromJS({
    storage: {
      input: {
        tables: [
          {
            changed_since: localState.get('changedSince', '')
          }
        ]
      }
    },
    parameters: {
      tables: [
        {
          incremental: localState.get('incremental', false)
        }
      ]
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    incremental: configuration.getIn(['parameters', 'tables', 0, 'incremental'], false),
    changedSince: configuration.getIn(['storage', 'input', 'tables', 0, 'changed_since'], '')
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
