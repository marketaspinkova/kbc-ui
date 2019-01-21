import Immutable from 'immutable';
import sourcePathAdapter from './SourcePath';
import { cases } from './SourcePath.spec.def';

describe('sourcePath', function() {
  describe('createConfiguration', function() {
    it('should return default configuration', function() {
      expect(cases.emptyWithDefaults.configuration).toEqual(
        sourcePathAdapter
          .createConfiguration(Immutable.fromJS(sourcePathAdapter.createConfiguration(Immutable.fromJS({})).toJS()))
          .toJS()
      );
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(cases[key].configuration).toEqual(
          sourcePathAdapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS()
        );
      });
    });
  });
  describe('parseConfiguration', function() {
    it('should return default configuration', function() {
      expect(cases.emptyWithDefaults.localState).toEqual(sourcePathAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(cases[key].localState).toEqual(
          sourcePathAdapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS()
        );
      });
    });
  });
});
