import Immutable from 'immutable';

const loadTypes = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
  ADAPTIVE: 'adaptive'
};

const createConfiguration = function(localState) {
  let incremental = false;
  let changedSince = localState.get('changedSince', '');
  if (localState.get('loadType') === loadTypes.INCREMENTAL) {
    incremental = true;
  }
  if (localState.get('loadType') === loadTypes.ADAPTIVE) {
    incremental = true;
    changedSince = 'adaptive';
  }
  const config = Immutable.fromJS({
    storage: {
      input: {
        tables: [
          {
            changed_since: changedSince
          }
        ]
      }
    },
    parameters: {
      tables: [
        {
          incremental: incremental
        }
      ]
    }
  });
  return config;
};

const parseConfiguration = function(configuration, context) {
  let loadType = loadTypes.FULL;
  let changedSince = configuration.getIn(['storage', 'input', 'tables', 0, 'changed_since'], '');
  if (configuration.getIn(['parameters', 'tables', 0, 'incremental']) === true) {
    loadType = loadTypes.INCREMENTAL;
    if (changedSince === 'adaptive') {
      loadType = loadTypes.ADAPTIVE;
      changedSince = '';
    }
  }
  return Immutable.fromJS({
    source: context.get('tableId', ''),
    loadType: loadType,
    changedSince: changedSince
  });
};

const createEmptyConfiguration = function() {
  return createConfiguration(Immutable.fromJS({}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration,
  loadTypes: loadTypes
};
