import Immutable from 'immutable';
import { getDefaultTable, hasWildcard, createConfiguration, parseConfiguration, getDefaultBucket } from './utils';

console.log(getDefaultTable); // eslint-disable-line
console.log(hasWildcard); // eslint-disable-line

const emptyLocalState = {};
const emptyConfiguration = {};

const emptyLocalStateWithDefaults = {
  awsAccessKeyId: '',
  awsSecretAccessKey: '',
  s3Bucket: '',
  s3Key: '',
  wildcard: false,
  destination: 'in.c-keboola-ex-s3-test.data',
  incremental: false,
  primaryKey: [],
  delimiter: ',',
  enclosure: '"'
};
const emptyConfigurationWithDefauls = {
  parameters: {
    accessKeyId: '',
    '#secretAccessKey': '',
    bucket: '',
    key: ''
  },
  processors: {
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
  },
  storage: {
    output: {
      tables: [
        {
          delimiter: ',',
          destination: 'in.c-keboola-ex-s3-test.data',
          enclosure: '"',
          incremental: false,
          primary_key: [],
          source: 'data.csv'
        }
      ]
    }
  }
};

const singleFileLocalState = {
  awsAccessKeyId: 'awsAccessKeyId',
  awsSecretAccessKey: 'awsSecretAccessKey',
  s3Bucket: 's3Bucket',
  s3Key: 'folder/file',
  wildcard: false,
  incremental: false,
  primaryKey: [],
  delimiter: ',',
  enclosure: '"',
  destination: 'in.c-keboola-ex-s3-test.data'
};
const singleFileConfiguration = {
  parameters: {
    accessKeyId: 'awsAccessKeyId',
    '#secretAccessKey': 'awsSecretAccessKey',
    bucket: 's3Bucket',
    key: 'folder/file'
  },
  processors: {
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
  },
  storage: {
    output: {
      tables: [
        {
          delimiter: ',',
          destination: 'in.c-keboola-ex-s3-test.data',
          enclosure: '"',
          incremental: false,
          primary_key: [],
          source: 'file'
        }
      ]
    }
  }
};

const wildcardLocalState = {
  awsAccessKeyId: 'awsAccessKeyId',
  awsSecretAccessKey: 'awsSecretAccessKey',
  s3Bucket: 's3Bucket',
  s3Key: 'folder/file',
  wildcard: true,
  incremental: true,
  primaryKey: ['col1'],
  delimiter: '|',
  enclosure: '\'',
  destination: 'in.c-keboola-ex-s3.someothertest'
};
const wildcardConfiguration = {
  parameters: {
    accessKeyId: 'awsAccessKeyId',
    '#secretAccessKey': 'awsSecretAccessKey',
    bucket: 's3Bucket',
    key: 'folder/file*'
  },
  processors: {
    after: [
      {
        definition: {
          component: 'keboola.processor-move-files'
        },
        parameters: {
          direction: 'tables'
        }
      },
      {
        definition: {
          component: 'keboola.processor.merge'
        }
      }
    ]
  },
  storage: {
    output: {
      tables: [
        {
          delimiter: '|',
          destination: 'in.c-keboola-ex-s3.someothertest',
          enclosure: '\'',
          incremental: true,
          primary_key: ['col1'],
          source: 'data.csv'
        }
      ]
    }
  }
};

describe('utils', function() {
  describe('#getDefaultTable()', function() {
    it('should return default table', function() {
      expect('in.c-keboola-ex-s3-123.data').toEqual(getDefaultTable('123'));
    });
  });

  describe('#getDefaultBucket()', function() {
    it('should return default bucket', function() {
      expect('in.c-keboola-ex-s3-123').toEqual(getDefaultBucket('123'));
    });
  });

  describe('#hasWildcard()', function() {
    it('should return false on empty string', function() {
      expect(false).toEqual(hasWildcard(''));
    });
    it('should return true on wildcard only', function() {
      expect(true).toEqual(hasWildcard('*'));
    });
    it('should return false on string without wildcard', function() {
      expect(false).toEqual(hasWildcard('my*key'));
    });
    it('should return true on wildcard', function() {
      expect(true).toEqual(hasWildcard('myKey*'));
    });
  });

  describe('#createConfiguration()', function() {
    it('should return an empty config with defaults from an empty local state', function() {
      expect(emptyConfigurationWithDefauls).toEqual(createConfiguration(Immutable.fromJS(emptyLocalState), 'test'));
    });
    it('should return an empty config with defaults from a local state with defaults', function() {
      expect(emptyConfigurationWithDefauls).toEqual(createConfiguration(Immutable.fromJS(emptyLocalStateWithDefaults), 'test'));
    });

    it('should return a valid config for a single file local state', function() {
      expect(singleFileConfiguration).toEqual(createConfiguration(Immutable.fromJS(singleFileLocalState), 'test'));
    });

    it('should return a valid config for a wildcard local state', function() {
      expect(wildcardConfiguration).toEqual(createConfiguration(Immutable.fromJS(wildcardLocalState), 'test'));
    });
  });

  describe('#parseConfiguration()', function() {
    it('should return empty localState with defaults from empty configuration', function() {
      expect(emptyLocalStateWithDefaults).toEqual(parseConfiguration(emptyConfiguration, 'test'));
    });
    it('should return empty localState with defaults from empty configuration with defaults', function() {
      expect(emptyLocalStateWithDefaults).toEqual(parseConfiguration(emptyConfigurationWithDefauls, 'test'));
    });
    it('should return a correct single file localState', function() {
      expect(singleFileLocalState).toEqual(parseConfiguration(singleFileConfiguration, 'test'));
    });
    it('should return a correct wildcard localState', function() {
      expect(wildcardLocalState).toEqual(parseConfiguration(wildcardConfiguration, 'test'));
    });
  });
});
