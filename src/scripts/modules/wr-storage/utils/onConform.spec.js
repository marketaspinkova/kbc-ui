import assert from 'assert';
import { fromJS } from 'immutable';
import { onConform, configDraft } from './onConform';
import * as cases from './onConform.spec.def';

describe('onConform()', function() {
  it('should return default config for empty configuration', function() {
    assert.deepEqual(onConform(fromJS({})), configDraft);
  });

  it('should return valid config for valid configuration', function() {
    assert.deepEqual(onConform(cases.validSimple), cases.validSimple);
  });

  it('should return valid config for old configuration format with incremental parameter', function() {
    assert.deepEqual(onConform(cases.incrementalFalse), cases.incrementalFalseExpected);
    assert.deepEqual(onConform(cases.incrementalTrue), cases.incrementalTrueExpected);
  });
});
