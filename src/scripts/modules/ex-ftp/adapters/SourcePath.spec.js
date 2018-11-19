import assert from 'assert';
import Immutable from 'immutable';
import sourcePathAdapter from './SourcePath';
import {cases} from './SourcePath.spec.def';

describe('sourcePath', function() {
  it('should return default configuration', function() {
    assert.deepEqual(
      cases.emptyConfig,
      sourcePathAdapter.createConfiguration(Immutable.fromJS({})).toJS());
  });

  it('should return localState with default from empty configuration', function() {
    assert.deepEqual(
      cases.emptyState,
      sourcePathAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
  });
}
);