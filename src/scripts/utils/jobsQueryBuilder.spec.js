import assert from 'assert';
import { getQuery, getLegacyComponentQuery } from './jobsQueryBuilder';

describe('getQuery', () => {
  it('should return a valid query', () => {
    assert.strictEqual('+params.component:component +params.config:config', getQuery('component', 'config'));
  });
});

describe('getLegacyComponentQuery', () => {
  it('should return a valid query', () => {
    assert.strictEqual('+component:component +params.config:config', getLegacyComponentQuery('component', 'config'));
  });
});