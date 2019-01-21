import Immutable from 'immutable';
import { createConfiguration, parseConfiguration } from './row';
import { cases } from './row.spec.def';

describe('row', function() {
  describe('createConfiguration()', function() {
    Object.keys(cases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(cases[key].configuration).toEqual(createConfiguration(Immutable.fromJS(cases[key].localState)).toJS());
      });
    });
  });

  describe('parseConfiguration()', function() {
    Object.keys(cases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        expect(cases[key].localState).toEqual(parseConfiguration(Immutable.fromJS(cases[key].configuration)).toJS());
      });
    });
  });
});
