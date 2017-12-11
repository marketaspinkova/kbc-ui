var assert = require('assert');
var Immutable = require('immutable');
var createConfiguration = require('./credentials').createConfiguration;
var parseConfiguration = require('./credentials').parseConfiguration;

const emptyLocalState = {};
const emptyConfiguration = {};

const emptyLocalStateWithDefaults = {
  awsAccessKeyId: '',
  awsSecretAccessKey: ''
};
const emptyConfigurationWithDefauls = {
  parameters: {
    accessKeyId: '',
    '#secretAccessKey': ''
  }
};

const simpleLocalState = {
  awsAccessKeyId: 'awsAccessKeyId',
  awsSecretAccessKey: 'awsSecretAccessKey'
};
const simpleConfiguration = {
  parameters: {
    accessKeyId: 'awsAccessKeyId',
    '#secretAccessKey': 'awsSecretAccessKey'
  }
};

describe('credentials', function() {
  describe('#createConfiguration()', function() {
    it('should return an empty config with defaults from an empty local state', function() {
      assert.deepEqual(emptyConfigurationWithDefauls, createConfiguration(Immutable.fromJS(emptyLocalState), 'test').toJS());
    });
    it('should return an empty config with defaults from a local state with defaults', function() {
      assert.deepEqual(emptyConfigurationWithDefauls, createConfiguration(Immutable.fromJS(emptyLocalStateWithDefaults), 'test').toJS());
    });
    it('should return a valid config for a simple local state', function() {
      assert.deepEqual(simpleConfiguration, createConfiguration(Immutable.fromJS(simpleLocalState), 'test').toJS());
    });
  });

  describe('#parseConfiguration()', function() {
    it('should return empty localState with defaults from empty configuration', function() {
      assert.deepEqual(emptyLocalStateWithDefaults, parseConfiguration(emptyConfiguration, 'test').toJS());
    });
    it('should return empty localState with defaults from empty configuration with defaults', function() {
      assert.deepEqual(emptyLocalStateWithDefaults, parseConfiguration(emptyConfigurationWithDefauls, 'test').toJS());
    });
    it('should return a correct simple localState', function() {
      assert.deepEqual(simpleLocalState, parseConfiguration(simpleConfiguration, 'test').toJS());
    });
  });
});
