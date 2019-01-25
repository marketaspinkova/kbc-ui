import { fromJS } from 'immutable';
import { createConfiguration, parseConfiguration } from './row';
import specDefinition from './row.spec.def';
import { conform } from './conform';

describe('row', function() {
  describe('createConfiguration()', function() {
    const newCases = specDefinition.newCases;
    Object.keys(newCases).forEach(function(key) {
      it('should return a valid config for a local state with ' + key, function() {
        expect(createConfiguration(fromJS(newCases[key].localState))).toEqual(
          fromJS(newCases[key].configuration)
        );
      });
    });

    it('should return a valid config for localState with read and write', function() {
      const spec = specDefinition.mixedCasesFromLocalstate.mixedReadAndWrite;
      expect(createConfiguration(fromJS(spec.localState))).toEqual(fromJS(spec.configuration));
    });
  });

  describe('parseConfiguration()', function() {
    const newCases = specDefinition.newCases;
    Object.keys(newCases).forEach(function(key) {
      it('should return a correct localState with ' + key + ' configuration', function() {
        expect(
          parseConfiguration(fromJS(newCases[key].configuration), fromJS(newCases[key].context))
        ).toEqual(fromJS(newCases[key].localState));
      });
    });

    it('should return a correct localState with mixed configuration', function() {
      const spec = specDefinition.mixedCasesFromConfiguration.mixedOldAndNew;
      expect(parseConfiguration(conform(fromJS(spec.configuration)), fromJS(spec.context))).toEqual(
        fromJS(spec.localState)
      );
    });

    const orginalCases = specDefinition.originalCasesForParseConfiguration;
    Object.keys(orginalCases).forEach(function(key) {
      it('should parse original configuration to new format when conformed', function() {
        expect(
          parseConfiguration(
            conform(fromJS(orginalCases[key].configuration)),
            fromJS(orginalCases[key].context)
          )
        ).toEqual(fromJS(orginalCases[key].localState));
      });
    });
  });
});
