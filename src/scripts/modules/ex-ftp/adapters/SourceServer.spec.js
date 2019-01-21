import Immutable from 'immutable';
import sourceServerAdapter from './SourceServer';
import {cases} from './SourceServer.spec.def';

describe('sourceServer', function() {
  describe('createConfiguration', function() {
    it('should return default configuration', function() {
      expect(cases.emptyConfig.configuration).toEqual(sourceServerAdapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for local state with ' + key, function() {
        expect(cases[key].configuration).toEqual(sourceServerAdapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });
  describe('parseConfiguration', function() {
    it('should return default configuration', function() {
      expect(cases.emptyConfig.localState).toEqual(sourceServerAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for local state with ' + key, function() {
        expect(cases[key].localState).toEqual(sourceServerAdapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });
}
);