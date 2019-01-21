import formatCardinalNumber from './formatCardinalNumber';

describe('formatCardinalNumber', () =>{
  describe('invalid input', () => {
    it('null should return N/A', () => {
      expect('N/A').toEqual(formatCardinalNumber(null));
    });
    it('empty string should return N/A', () => {
      expect('N/A').toEqual(formatCardinalNumber(''));
    });
    it('invalid number should return N/A', () => {
      expect('N/A').toEqual(formatCardinalNumber('asdafa'));
    });
  });

  describe('valid string input', () => {
    it('0 should return 0', () => {
      expect('0').toEqual(formatCardinalNumber('0'));
    });
    it('1 should return 1', () => {
      expect('1').toEqual(formatCardinalNumber('1'));
    });
    it('100 should return 100', () => {
      expect('100').toEqual(formatCardinalNumber('100'));
    });
    it('1234 should return 1,234', () => {
      expect('1,234').toEqual(formatCardinalNumber('1234'));
    });
    it('1234567 should return 1,234,567', () => {
      expect('1,234,567').toEqual(formatCardinalNumber('1234567'));
    });
  });

  describe('valid integer input', () => {
    it('0 should return 0', () => {
      expect('0').toEqual(formatCardinalNumber(0));
    });
    it('1 should return 1', () => {
      expect('1').toEqual(formatCardinalNumber(1));
    });
    it('100 should return 100', () => {
      expect('100').toEqual(formatCardinalNumber(100));
    });
    it('1234 should return 1,234', () => {
      expect('1,234').toEqual(formatCardinalNumber(1234));
    });
    it('1234567 should return 1,234,567', () => {
      expect('1,234,567').toEqual(formatCardinalNumber(1234567));
    });
  });
});
