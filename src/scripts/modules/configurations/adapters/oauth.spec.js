import Immutable from 'immutable';
import adapter from './oauth';
import { cases } from './oauth.spec.def';

describe('oauth', function() {
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
    it('should return empty localState with defaults from empty configuration and context', function() {
      expect(cases.emptyWithDefaults.localState).toEqual(adapter.parseConfiguration(Immutable.fromJS({}), Immutable.fromJS({})).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration and context', function() {
        expect(cases[key].localState).toEqual(adapter.parseConfiguration(Immutable.fromJS(cases[key].configuration), Immutable.fromJS(cases[key].context)).toJS());
      });
    });
  });

  describe('isComplete()', function() {
    it('should return false if the config is not complete or empty', function() {
      expect(false).toEqual(adapter.isComplete(Immutable.fromJS({})));
      expect(false).toEqual(adapter.isComplete(Immutable.fromJS({authorization: {oauth_api: {id: ''}}})));
    });
    it('should return true if the config is complete', function() {
      expect(true).toEqual(adapter.isComplete(Immutable.fromJS({authorization: {oauth_api: {id: 'test'}}})));
    });
  });
});
