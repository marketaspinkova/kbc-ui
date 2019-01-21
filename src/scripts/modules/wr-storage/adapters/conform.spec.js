import { fromJS } from 'immutable';
import { conform, configDraft } from './conform';
import * as cases from './conform.spec.def';

describe('conform()', function() {
  it('should return default config for empty configuration', function() {
    expect(configDraft).toEqual(conform(fromJS({})));
  });

  it('should return valid config for valid configuration', function() {
    expect(cases.validSimple).toEqual(conform(cases.validSimple));
  });

  it('should return valid config for old configuration format with incremental parameter', function() {
    expect(cases.incrementalFalseExpected).toEqual(conform(cases.incrementalFalse));
    expect(cases.incrementalTrueExpected).toEqual(conform(cases.incrementalTrue));
  });
});
