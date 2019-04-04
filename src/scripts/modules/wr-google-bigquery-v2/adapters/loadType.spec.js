import Immutable from 'immutable';
import adapter from './loadType';
import { cases } from './loadType.spec.def';

const emptyContext = Immutable.Map();

describe('loadType', function() {
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
      expect(cases.emptyWithDefaults.localState).toEqual(adapter.parseConfiguration(Immutable.fromJS({}), emptyContext).toJS());
    });
    it('should populate source from context', function() {
      const context = Immutable.fromJS({
        tableId: 'in.c-mybucket.table'
      });
      const localState = Object.assign({}, cases.emptyWithDefaults.localState);
      localState.source = 'in.c-mybucket.table';
      expect(localState).toEqual(adapter.parseConfiguration(Immutable.fromJS({}), context).toJS());
    });
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        expect(cases[key].localState).toEqual(adapter.parseConfiguration(Immutable.fromJS(cases[key].configuration), emptyContext).toJS());
      });
    });
  });

  describe('createEmptyConfiguration()', function() {
    it('should return a default configuration with the table details filled in', function() {
      expect(adapter.createEmptyConfiguration('in.c-bucket.test').toJS()).toEqual(adapter.createConfiguration(Immutable.fromJS({})).toJS());
    });
  });
});
