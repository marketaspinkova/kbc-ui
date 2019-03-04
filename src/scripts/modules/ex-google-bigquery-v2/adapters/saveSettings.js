import Immutable from 'immutable';
import string from "../../../utils/string";

const generateDefaultOutputTable = function(name) {
  const queryName = string.sanitizeKbcTableIdString(name);
  const bucketName = string.sanitizeKbcTableIdString('keboola.ex-google-bigquery-v2');

  return 'in.c-' + bucketName + '.' + queryName;
}

const createConfiguration = function(localState) {
  return Immutable.fromJS({
    parameters: {
      query: {
        outputTable: localState.get('outputTable', ''),
        incremental: localState.get('incremental', false),
        primaryKey: localState.get('primaryKey', Immutable.List()).toJS()
      }
    }
  });
};

const parseConfiguration = function(configuration) {
  const query = configuration.getIn(['parameters', 'query'], Immutable.Map());

  let outputTable = query.get('outputTable', '');
  if (outputTable === '') {
    outputTable = generateDefaultOutputTable(query.get('name', ''))
  }

  return Immutable.fromJS({
    outputTable: outputTable,
    incremental: query.get('incremental', false),
    primaryKey: query.get('primaryKey', Immutable.List()).toJS(),
    destinationEditing: true
  });
};

const createEmptyConfiguration = function(name) {
  return createConfiguration(Immutable.fromJS({outputTable: generateDefaultOutputTable(name)}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
