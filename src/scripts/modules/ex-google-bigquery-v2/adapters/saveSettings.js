import Immutable from 'immutable';
import string from "../../../utils/string";

const createConfiguration = function(localState) {
  const config = Immutable.fromJS({
    parameters: {
      query: {
        outputTable: localState.get('outputTable', ''),
        incremental: localState.get('incremental', false),
        primaryKey: localState.get('primaryKey', Immutable.List()).toJS()
      }
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  const query = configuration.getIn(['parameters', 'query'], Immutable.Map());

  return Immutable.fromJS({
    outputTable: query.get('outputTable', ''),
    incremental: query.get('incremental', false),
    primaryKey: query.get('primaryKey', Immutable.List()).toJS()
  });
};

const createEmptyConfiguration = function(name) {
  const qname = string.sanitizeKbcTableIdString(name);
  const bucketName = string.sanitizeKbcTableIdString('keboola.ex-google-bigquery-v2');

  return createConfiguration(Immutable.fromJS({outputTable: 'in.c-' + bucketName + '.' + qname}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};
