import Immutable from 'immutable';
import adapter from './targetDataset';
import {cases} from './targetDataset.spec.def';

describe('targetDataset', function() {
  describe('createConfiguration()', function() {
    it('should return an empty config from an empty local state', function() {
      expect({}).toEqual(adapter.createConfiguration(Immutable.fromJS({})).toJS());
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

  describe('isComplete()', function() {
    it('should return false with empty configuration', function() {
      expect(false).toEqual(adapter.isComplete(Immutable.fromJS({})));
    });
    it('should return true when parameters are filled', function() {
      expect(true).toEqual(adapter.isComplete(Immutable.fromJS({parameters: {'project': 'a', 'dataset': 'b'}})));
    });
  });
});
