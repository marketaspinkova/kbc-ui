import generateId from './generateId';

jest.mock('./randomNumber', () => {
  const randomNumberOrig = jest.requireActual('./randomNumber');
  return {
    __esModule: true,
    default: function(max) {
      return randomNumberOrig.default(max || 100);
    }
  };
});

describe('generateId', () => {
  test('random id is smaller or equal to 100', () => {
    expect(generateId()).toBeLessThanOrEqual(100);
  });
  test('random id is not from existing ids', () => {
    const existingIds = [];
    for (let i = 2; i <= 100; i++) {
      existingIds.push(i);
    }
    expect(generateId(existingIds, 100)).toBe(1);
  });
});
