import Immutable from 'immutable';

export const getDefaultBucket = function(configId) {
  return 'in.c-keboola-ex-s3-' + configId;
};

export const getDefaultTable = function(configId) {
  return getDefaultBucket(configId) + '.data';
};

export const hasWildcard = function(key) {
  return key.substring(key.length - 1, key.length) === '*';
};

export const createConfiguration = function(localState, configId) {
  var mapping = {};
  var s3Key = localState.get('s3Key', '');

  mapping.source = 'data.csv';
  mapping.destination = localState.get('destination', getDefaultTable(configId));
  mapping.incremental = localState.get('incremental', false);
  mapping.primary_key = localState.get('primaryKey', Immutable.List()).toJS();
  mapping.delimiter = localState.get('delimiter', ',');
  mapping.enclosure = localState.get('enclosure', '"');
  if (localState.get('wildcard')) {
    mapping.source = 'data.csv';
  } else if (s3Key !== '') {
    mapping.source = s3Key.substring(s3Key.lastIndexOf('/') + 1);
  }

  var processors = {
    after: [
      {
        definition: {
          component: 'keboola.processor-move-files'
        },
        parameters: {
          direction: 'tables'
        }
      }
    ]
  };

  if (localState.get('wildcard', false)) {
    s3Key = s3Key + '*';
    processors.after.push({
      definition: {
        component: 'keboola.processor.merge'
      }
    });
  }

  const config = {
    parameters: {
      accessKeyId: localState.get('awsAccessKeyId', ''),
      '#secretAccessKey': localState.get('awsSecretAccessKey', ''),
      bucket: localState.get('s3Bucket', ''),
      key: s3Key
    },
    storage: {
      output: {
        tables: [
          mapping
        ]
      }
    },
    processors: processors
  };
  return config;
};

export const parseConfiguration = function(configuration, configId) {
  const configData = Immutable.fromJS(configuration);
  const s3Key = configData.getIn(['parameters', 'key'], '');
  return {
    awsAccessKeyId: configData.getIn(['parameters', 'accessKeyId'], ''),
    awsSecretAccessKey: configData.getIn(['parameters', '#secretAccessKey'], ''),
    s3Bucket: configData.getIn(['parameters', 'bucket'], ''),
    s3Key: hasWildcard(s3Key) ? s3Key.substring(0, s3Key.length - 1) : s3Key,
    wildcard: hasWildcard(s3Key),
    destination: configData.getIn(['storage', 'output', 'tables', 0, 'destination'], getDefaultTable(configId)),
    incremental: configData.getIn(['storage', 'output', 'tables', 0, 'incremental'], false),
    primaryKey: configData.getIn(['storage', 'output', 'tables', 0, 'primary_key'], Immutable.List()).toJS(),
    delimiter: configData.getIn(['storage', 'output', 'tables', 0, 'delimiter'], ','),
    enclosure: configData.getIn(['storage', 'output', 'tables', 0, 'enclosure'], '"')
  };
};

export default {
  getDefaultTable,
  getDefaultBucket,
  hasWildcard,
  createConfiguration,
  parseConfiguration
};
