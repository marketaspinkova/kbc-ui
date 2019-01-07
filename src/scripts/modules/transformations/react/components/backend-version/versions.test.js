import assert from 'assert';
import moment from 'moment';
import { hasVersions, getVersions } from './versions';
import { transformationType } from '../../../Constants';

describe('hasVersions', () => {
  it('should return true for date before until', () => {
    assert.strictEqual(true, hasVersions(transformationType.R, moment('2018-12-31').unix()));
  });
  it('should return true for date after until', () => {
    assert.strictEqual(false, hasVersions(transformationType.R, moment('2019-01-02').unix()));
  });
  it('should return false unknown backend', () => {
    assert.strictEqual(false, hasVersions('random-backend', moment('2019-01-02').unix()));
  });
});

describe('getVersions', () => {
  it('should return non empty array for date before until', () => {
    assert.strictEqual(true, getVersions(transformationType.R, moment('2018-12-31').unix()).length >= 2);
  });
  it('should return array with latest version for date after until', () => {
    assert.strictEqual(true, getVersions(transformationType.R, moment('2019-01-02').unix()).length >= 1);
  });
  it('should return empty array for unknown backend', () => {
    assert.strictEqual(true, getVersions('random-backend', moment().unix()).length === 0);
  });
});
