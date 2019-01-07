import assert from 'assert';
import { hasVersions, getVersions } from './versions';
import { transformationType } from '../../../Constants';

describe('hasVersions', () => {
  it('should return true for date before until', () => {
    assert.strictEqual(true, hasVersions(transformationType.R, '2018-12-31'));
  });
  it('should return false for date after until', () => {
    assert.strictEqual(false, hasVersions(transformationType.R, '2019-01-02'));
  });
  it('should return false unknown backend', () => {
    assert.strictEqual(false, hasVersions('random-backend'));
  });
});

describe('getVersions', () => {
  it('should return non empty array for date before until', () => {
    assert.strictEqual(true, getVersions(transformationType.R, '2018-12-31').length >= 2);
  });
  it('should return array with latest version for date after until', () => {
    assert.strictEqual(true, getVersions(transformationType.R, '2019-01-02').length >= 1);
  });
  it('should return empty array for unknown backend', () => {
    assert.strictEqual(true, getVersions('random-backend').length === 0);
  });
});
