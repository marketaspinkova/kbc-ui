import Immutable from 'immutable';
import adapter from './saveSettings';
import { cases } from './saveSettings.spec.def';

describe('row', function() {
  describe('createConfiguration()', function() {
    it('should return an empty config with defaults from an empty local state', function() {
      expect(cases.emptyWithDefaults.configuration).toEqual(adapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(cases[key].configuration).toEqual(adapter.createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });

  describe('parseConfiguration()', function() {
    it('should return empty localState with defaults from empty configuration', function() {
      expect(cases.emptyWithDefaults.localState).toEqual(adapter.parseConfiguration(Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        expect(cases[key].localState).toEqual(adapter.parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });

  describe('createEmptyConfiguration()', function() {
    it('should return a default config with the webalized name filled in', function() {
      expect(adapter.createEmptyConfiguration().toJS()).toEqual(adapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
  });
});
