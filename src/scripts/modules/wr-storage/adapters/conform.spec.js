import assert from 'assert';
import { fromJS } from 'immutable';
import { conform, configDraft } from './conform';
import * as cases from './conform.spec.def';

describe('conform()', function() {
  it('should return default config for empty configuration', function() {
    assert.deepEqual(conform(fromJS({})), configDraft);
  });

  it('should return valid config for valid configuration', function() {
    assert.deepEqual(conform(cases.validSimple), cases.validSimple);
  });

  it('should return valid config for old configuration format with incremental parameter', function() {
    assert.deepEqual(conform(cases.incrementalFalse), cases.incrementalFalseExpected);
    assert.deepEqual(conform(cases.incrementalTrue), cases.incrementalTrueExpected);
  });
});
