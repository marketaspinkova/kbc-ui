import assert from 'assert';
import { validate } from './columnTypeValidation';

describe('columnTypeValidation', () => {
  describe('binary', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('binary', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('binary', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('binary', 0), false));
    it('must be numeric', () => assert.equal(validate('binary', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('binary', ''), false));
  });

  describe('char', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('char', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('char', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('char', 0), false));
    it('must be numeric', () => assert.equal(validate('char', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('char', ''), false));
  });

  describe('character', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('character', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('character', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('character', 0), false));
    it('must be numeric', () => assert.equal(validate('character', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('character', ''), false));
  });

  describe('string', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('string', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('string', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('string', 0), false));
    it('must be numeric', () => assert.equal(validate('string', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('string', ''), false));
  });

  describe('text', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('text', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('text', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('text', 0), false));
    it('must be numeric', () => assert.equal(validate('text', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('text', ''), false));
  });

  describe('varchar', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('varchar', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('varchar', '5'), true));
    it('must be bigger that zero', () => assert.equal(validate('varchar', 0), false));
    it('must be numeric', () => assert.equal(validate('varchar', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('varchar', ''), false));
  });

  describe('decimal', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('decimal', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('decimal', '5'), true));
    it('can accept precizion', () => assert.equal(validate('decimal', '5,2'), true));
    it('dot delimiter is not valid', () => assert.equal(validate('decimal', '5.2'), false));
    it('must be bigger that zero', () => assert.equal(validate('decimal', 0), false));
    it('must be numeric', () => assert.equal(validate('decimal', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('decimal', ''), false));
  });

  describe('number', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('number', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('number', '5'), true));
    it('can accept precizion', () => assert.equal(validate('number', '5,2'), true));
    it('dot delimiter is not valid', () => assert.equal(validate('number', '5.2'), false));
    it('must be bigger that zero', () => assert.equal(validate('number', 0), false));
    it('must be numeric', () => assert.equal(validate('number', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('number', ''), false));
  });

  describe('numeric', () => {
    it('number bigger that zero is fine', () => assert.equal(validate('numeric', 10), true));
    it('even string numeric value is fine', () => assert.equal(validate('numeric', '5'), true));
    it('can accept precizion', () => assert.equal(validate('numeric', '5,2'), true));
    it('dot delimiter is not valid', () => assert.equal(validate('numeric', '5.2'), false));
    it('must be bigger that zero', () => assert.equal(validate('numeric', 0), false));
    it('must be numeric', () => assert.equal(validate('numeric', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('numeric', ''), false));
  });

  describe('time', () => {
    it('number in range 0-9', () => {
      assert.equal(validate('time', 0), true);
      assert.equal(validate('time', 3), true);
      assert.equal(validate('time', 9), true);
    });
    it('even string numeric value is fine', () => assert.equal(validate('time', '5'), true));
    it('number bigger than 9 is invalid', () => assert.equal(validate('time', 10), false));
    it('number smaller than 0 is invalid', () => assert.equal(validate('time', -1), false));
    it('must be numeric', () => assert.equal(validate('time', 'baz'), false));
    it('can not be empty', () => assert.equal(validate('time', ''), false));
  });
});
