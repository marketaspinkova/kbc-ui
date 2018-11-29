import assert from 'assert';
import Immutable from 'immutable';
import sourcePathAdapter from './SourcePath';
import {cases} from './SourcePath.spec.def';

describe('sourcePath', function() {
  describe('createConfiguration', function() {
    it('should return default configuration', function() {
      assert.deepEqual(
        cases.emptyWithDefaults.configuration,
        sourcePathAdapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        assert.deepEqual(cases[key].configuration, sourcePathAdapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });
  describe('parseConfiguration', function() {
    it('should return default configuration', function() {
      assert.deepEqual(
        cases.emptyWithDefaults.localState,
        sourcePathAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        assert.deepEqual(cases[key].localState, sourcePathAdapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });
});