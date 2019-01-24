import Immutable from 'immutable';
import { conform } from './conform';
import specDefinition from './conform.spec.def';

describe('conform', function() {
  const cases = specDefinition;
  Object.keys(cases).forEach(function(key) {
    it('should return a valid config for a local state with ' + key, function() {
      expect(conform(Immutable.fromJS(cases[key].sourceConfig)))
        .toEqual(Immutable.fromJS(cases[key].expectedConfig));
    });
  });
});

