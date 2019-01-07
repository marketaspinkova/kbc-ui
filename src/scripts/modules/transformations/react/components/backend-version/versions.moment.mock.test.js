import assert from 'assert';
import { hasVersions, getVersions } from './versions';
import { transformationType } from '../../../Constants';

jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return (date) => {
    // if date is not passed it'll use 2018-12-31 in ms
    return date ? moment(date) : moment(1546210800000);
  };
});

describe('hasVersions', () => {
  it('should return true for date before until', () => {
    assert.strictEqual(true, hasVersions(transformationType.R));
  });
});

describe('getVersions', () => {
  it('should return non empty array for date before until', () => {
    assert.strictEqual(true, getVersions(transformationType.R).length >= 2);
  });
});
