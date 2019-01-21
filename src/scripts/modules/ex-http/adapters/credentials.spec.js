import Immutable from 'immutable';
import { createConfiguration, parseConfiguration, isComplete } from './credentials';
import { cases } from './credentials.spec.def';

describe('credentials', function() {
  describe('createConfiguration()', function() {
    it('should return an empty config with defaults from an empty local state', function() {
      expect(cases.emptyWithDefaults.configuration).toEqual(createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(cases[key].configuration).toEqual(createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });

  describe('parseConfiguration()', function() {
    it('should return empty localState with defaults from empty configuration', function() {
      expect(cases.emptyWithDefaults.localState).toEqual(parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        expect(cases[key].localState).toEqual(parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });

  describe('isComplete()', function() {
    it('should return false with empty configuration', function() {
      expect(false).toEqual(isComplete(Immutable.fromJS({})));
    });
    it('should return true when parameters are filled', function() {
      expect(true).toEqual(isComplete(Immutable.fromJS({parameters: {'baseUrl': 'a'}})));
    });
  });
});
