import { hasVersions, getVersions } from './versions';
import { transformationType } from '../../../Constants';

describe('hasVersions', () => {
  it('should return true for date before until', () => {
    expect(true).toEqual(hasVersions(transformationType.R, '2018-12-31'));
  });
  it('should return false for date after until', () => {
    expect(false).toEqual(hasVersions(transformationType.R, '2100-01-01'));
  });
  it('should return false unknown backend', () => {
    expect(false).toEqual(hasVersions('random-backend'));
  });
});

describe('getVersions', () => {
  it('should return non empty array for date before until', () => {
    expect(true).toEqual(getVersions(transformationType.R, '2018-12-31').length >= 2);
  });
  it('should return array with latest version for date after until', () => {
    expect(true).toEqual(getVersions(transformationType.R, '2019-01-02').length >= 1);
  });
  it('should return empty array for unknown backend', () => {
    expect(true).toEqual(getVersions('random-backend').length === 0);
  });
});
