import assert from 'assert';
import { getQuery, getLegacyComponentQuery } from './jobsQueryBuilder';

describe('getQuery', () => {
  it('should return a valid query', () => {
    assert.strictEqual('+params.component:component +params.config:config', getQuery('component', 'config'));
  });
  it('should return a valid query with rowId', () => {
    assert.strictEqual('+params.component:component +params.config:config +(params.row:row OR (NOT _exists_: params.row))', getQuery('component', 'config', 'row'));
  });
});

describe('getLegacyComponentQuery', () => {
  it('should return a valid query', () => {
    assert.strictEqual('+component:component +params.config:config', getLegacyComponentQuery('component', 'config'));
  });
  it('should return a valid query with rowId for transformations', () => {
    assert.strictEqual('+component:transformation +params.config:config +(params.transformations:row OR (NOT _exists_: params.transformations))', getLegacyComponentQuery('transformation', 'config', 'row'));
  });
  it('should return fail for query with rowId for another component', () => {
    try {
      getLegacyComponentQuery('component', 'config', 'row');
      assert.fail('Should have failed');
    } catch (exception) {
      assert.strictEqual('Component component does not support rows', exception.message);
    }
  });
});