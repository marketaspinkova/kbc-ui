import { resolveBackendName, isKnownTransformationType } from './transformationTypes';
import { fromJS } from 'immutable';

describe('resolveBackendName()', () => {
  it('should return backend for snowflake', () => {
    const transformation = fromJS({
      backend: 'snowflake',
      type: 'dummy'
    });
    expect('snowflake').toEqual(resolveBackendName(transformation));
  });
  it('should return backend for redshift', () => {
    const transformation = fromJS({
      backend: 'redshift',
      type: 'dummy'
    });
    expect('redshift').toEqual(resolveBackendName(transformation));
  });
  it('should return type for docker', () => {
    const transformation = fromJS({
      backend: 'docker',
      type: 'dummy'
    });
    expect('dummy').toEqual(resolveBackendName(transformation));
  });
});

describe('isKnownTransformationType()', () => {
  it('should return true for snowflake', () => {
    const transformation = fromJS({
      backend: 'snowflake',
      type: 'dummy'
    });
    expect(true).toEqual(isKnownTransformationType(transformation));
  });
  it('should return true for python', () => {
    const transformation = fromJS({
      backend: 'docker',
      type: 'python'
    });
    expect(true).toEqual(isKnownTransformationType(transformation));
  });
  it('should return false for unknown docker type', () => {
    const transformation = fromJS({
      backend: 'docker',
      type: 'dummy'
    });
    expect(false).toEqual(isKnownTransformationType(transformation));
  });
  it('should return false for unknown backend', () => {
    const transformation = fromJS({
      backend: 'dummy',
      type: 'dummy'
    });
    expect(false).toEqual(isKnownTransformationType(transformation));
  });
});
