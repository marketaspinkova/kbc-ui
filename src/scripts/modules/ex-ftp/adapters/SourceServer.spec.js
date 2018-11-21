import assert from 'assert';
import Immutable from 'immutable';
import sourceServerAdapter from './SourceServer';
import {cases} from './SourceServer.spec.def';

describe('sourceServer', function() {
  it('should return default configuration', function() {
    assert.deepEqual(
      cases.emptyConfig,
      sourceServerAdapter.createConfiguration(Immutable.fromJS({})).toJS());
  });

  it('should return localState with default from empty configuration', function() {
    assert.deepEqual(
      cases.emptyState,
      sourceServerAdapter.parseConfiguration(Immutable.fromJS({})).toJS());
  });

  it('should return change host from default configuration', function() {
    assert.deepEqual(
      cases.changedConfig,
      sourceServerAdapter.createConfiguration(Immutable.fromJS({'host': 'changed-host.com', port: 100})).toJS()
    );
  });
}
);