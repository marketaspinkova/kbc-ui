import { getQuery, getLegacyComponentQuery } from './jobsQueryBuilder';

describe('getQuery', () => {
  it('should return a valid query', () => {
    expect('+params.component:component +params.config:config').toEqual(getQuery('component', 'config'));
  });
  it('should return a valid query with rowId', () => {
    expect('+params.component:component +params.config:config +(params.row:row OR (NOT _exists_: params.row))').toEqual(getQuery('component', 'config', 'row'));
  });
});

describe('getLegacyComponentQuery', () => {
  it('should return a valid query', () => {
    expect('+component:component +params.config:config').toEqual(getLegacyComponentQuery('component', 'config'));
  });
  it('should return a valid query with rowId for transformations', () => {
    expect('+component:transformation +params.config:config +(params.transformations:row OR (NOT _exists_: params.transformations))').toEqual(getLegacyComponentQuery('transformation', 'config', 'row'));
  });
  it('should return fail for query with rowId for another component', () => {
    try {
      getLegacyComponentQuery('component', 'config', 'row');
      expect.fail('Should have failed');
    } catch (exception) {
      expect('Component component does not support rows').toEqual(exception.message);
    }
  });
});