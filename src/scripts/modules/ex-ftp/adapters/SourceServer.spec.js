import assert from 'assert';
import Immutable from 'immutable';
import sourceServerAdapter from './SourceServer';
import {cases} from './SourceServer.spec.def';

describe('sourceServer', function() {
  describe('createConfiguration', function() {
    it('should return default configuration', function() {
      assert.deepEqual(
        cases.emptyConfig.configuration,
        sourceServerAdapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for local state with ' + key, function() {
        assert.deepEqual(cases[key].configuration, sourceServerAdapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });
  describe('parseConfiguration', function() {
    it('should return default configuration', function() {
      assert.deepEqual(
        cases.emptyConfig.localState,
        sourceServerAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for local state with ' + key, function() {
        assert.deepEqual(cases[key].localState, sourceServerAdapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });
}
);