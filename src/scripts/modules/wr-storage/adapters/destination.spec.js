import assert from 'assert';
import Immutable from 'immutable';
import adapter from './destination';
import { cases, casesWithIncrement } from './destination.spec.def';

describe('destination', function() {
  describe('createConfiguration()', function() {
    it('should return an empty config with defaults from an empty local state', function() {
      assert.deepEqual(cases.emptyWithDefaults.configuration, adapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        assert.deepEqual(cases[key].configuration, adapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
    it('should return a valid config for a old local state with incremental set to false', function() {
      assert.deepEqual(casesWithIncrement.disable.newConfiguration, adapter.createConfiguration(Immutable.fromJS(casesWithIncrement.disable.localState)).toJS());
    });
    it('should return a valid config for a old local state with incremental set to true', function() {
      assert.deepEqual(casesWithIncrement.enable.newConfiguration, adapter.createConfiguration(Immutable.fromJS(casesWithIncrement.enable.localState)).toJS());
    });
  });

  describe('parseConfiguration()', function() {
    it('should return empty localState with defaults from empty configuration', function() {
      assert.deepEqual(cases.emptyWithDefaults.localState, adapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        assert.deepEqual(cases[key].localState, adapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
    it('should return a correct localState with old configuration format with incremental set to false', function() {
      assert.deepEqual(casesWithIncrement.disable.localState, adapter.parseConfiguration(Immutable.fromJS(casesWithIncrement.disable.oldConfiguration)).toJS());
    });
    it('should return a correct localState with old configuration format with incremental set to true', function() {
      assert.deepEqual(casesWithIncrement.enable.localState, adapter.parseConfiguration(Immutable.fromJS(casesWithIncrement.enable.oldConfiguration)).toJS());
    });
  });

  describe('createEmptyConfiguration()', function() {
    it('should return a default configuration with the table details filled in', function() {
      assert.deepEqual(adapter.createEmptyConfiguration('in.c-bucket.test').toJS(), adapter.createConfiguration(Immutable.fromJS({destination: 'test'})).toJS());
    });
  });
});
