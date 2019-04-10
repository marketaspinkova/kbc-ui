import { validate } from './columnTypeValidation';

describe('columnTypeValidation', () => {
  describe('binary', () => {
    it('number bigger that zero is fine', () => expect(validate('binary', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('binary', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('binary', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('binary', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('binary', '')).toEqual(false));
  });

  describe('char', () => {
    it('number bigger that zero is fine', () => expect(validate('char', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('char', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('char', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('char', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('char', '')).toEqual(false));
  });

  describe('character', () => {
    it('number bigger that zero is fine', () => expect(validate('character', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('character', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('character', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('character', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('character', '')).toEqual(false));
  });

  describe('string', () => {
    it('number bigger that zero is fine', () => expect(validate('string', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('string', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('string', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('string', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('string', '')).toEqual(false));
  });

  describe('text', () => {
    it('number bigger that zero is fine', () => expect(validate('text', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('text', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('text', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('text', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('text', '')).toEqual(false));
  });

  describe('varchar', () => {
    it('number bigger that zero is fine', () => expect(validate('varchar', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('varchar', '5')).toEqual(true));
    it('must be bigger that zero', () => expect(validate('varchar', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('varchar', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('varchar', '')).toEqual(false));
  });

  describe('decimal', () => {
    it('number bigger that zero is fine', () => expect(validate('decimal', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('decimal', '5')).toEqual(true));
    it('can accept precizion', () => expect(validate('decimal', '5,2')).toEqual(true));
    it('dot delimiter is not valid', () => expect(validate('decimal', '5.2')).toEqual(false));
    it('must be bigger that zero', () => expect(validate('decimal', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('decimal', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('decimal', '')).toEqual(false));
  });

  describe('number', () => {
    it('number bigger that zero is fine', () => expect(validate('number', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('number', '5')).toEqual(true));
    it('can accept precizion', () => expect(validate('number', '5,2')).toEqual(true));
    it('dot delimiter is not valid', () => expect(validate('number', '5.2')).toEqual(false));
    it('must be bigger that zero', () => expect(validate('number', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('number', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('number', '')).toEqual(false));
  });

  describe('numeric', () => {
    it('number bigger that zero is fine', () => expect(validate('numeric', 10)).toEqual(true));
    it('even string numeric value is fine', () => expect(validate('numeric', '5')).toEqual(true));
    it('can accept precizion', () => expect(validate('numeric', '5,2')).toEqual(true));
    it('dot delimiter is not valid', () => expect(validate('numeric', '5.2')).toEqual(false));
    it('must be bigger that zero', () => expect(validate('numeric', 0)).toEqual(false));
    it('must be numeric', () => expect(validate('numeric', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('numeric', '')).toEqual(false));
  });

  describe('integer', () => {
    it('number bigger that zero is fine', () => expect(validate('integer', 10)).toEqual(true));
    it('even string integer value is fine', () => expect(validate('integer', '5')).toEqual(true));
    it('can accept precizion', () => expect(validate('integer', '5,2')).toEqual(true));
    it('dot delimiter is not valid', () => expect(validate('integer', '5.2')).toEqual(false));
    it('must be bigger that zero', () => expect(validate('integer', 0)).toEqual(false));
    it('must be integer', () => expect(validate('integer', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('integer', '')).toEqual(false));
  });

  describe('time', () => {
    it('number in range 0-9', () => {
      expect(validate('time', 0)).toEqual(true);
      expect(validate('time', 3)).toEqual(true);
      expect(validate('time', 9)).toEqual(true);
    });
    it('even string numeric value is fine', () => expect(validate('time', '5')).toEqual(true));
    it('number bigger than 9 is invalid', () => expect(validate('time', 10)).toEqual(false));
    it('number smaller than 0 is invalid', () => expect(validate('time', -1)).toEqual(false));
    it('must be numeric', () => expect(validate('time', 'baz')).toEqual(false));
    it('can not be empty', () => expect(validate('time', '')).toEqual(false));
  });

  describe('type is not case sensitive', () => {
    it('number bigger that zero is fine', () => expect(validate('integer', 10)).toEqual(true));
    it('number bigger that zero is fine', () => expect(validate('INTEGER', 10)).toEqual(true));
  });
});
