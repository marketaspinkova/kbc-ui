import changedSinceOptionCreator from './changedSinceOptionCreator';

describe('changedSinceOptionCreator', function() {
  describe('valid options', function() {
    it('1', function() {
      expect('1 hour').toEqual(changedSinceOptionCreator('1'));
    });
    it('2', function() {
      expect('2 hours').toEqual(changedSinceOptionCreator('2'));
    });
    it('1m', function() {
      expect('1 minute').toEqual(changedSinceOptionCreator('1m'));
    });
    it('2m', function() {
      expect('2 minutes').toEqual(changedSinceOptionCreator('2m'));
    });
    it('1h', function() {
      expect('1 hour').toEqual(changedSinceOptionCreator('1h'));
    });
    it('2h', function() {
      expect('2 hours').toEqual(changedSinceOptionCreator('2h'));
    });
    it('1d', function() {
      expect('1 day').toEqual(changedSinceOptionCreator('1d'));
    });
    it('2d', function() {
      expect('2 days').toEqual(changedSinceOptionCreator('2d'));
    });
    it('1 m', function() {
      expect('1 minute').toEqual(changedSinceOptionCreator('1 m'));
    });
    it('1min', function() {
      expect('1 minute').toEqual(changedSinceOptionCreator('1min'));
    });
    it('-1m', function() {
      expect('1 minute').toEqual(changedSinceOptionCreator('-1m'));
    });
    it('1M', function() {
      expect('1 minute').toEqual(changedSinceOptionCreator('1M'));
    });
  });

  describe('invalid options', function() {
    it('invalid', function() {
      expect(false).toEqual(changedSinceOptionCreator('invalid'));
    });
    it('empty string', function() {
      expect(false).toEqual(changedSinceOptionCreator(''));
    });
    it('null', function() {
      expect(false).toEqual(changedSinceOptionCreator(null));
    });
    it('a b', function() {
      expect(false).toEqual(changedSinceOptionCreator('a b'));
    });
    it('1 2', function() {
      expect(false).toEqual(changedSinceOptionCreator('1 2'));
    });
    it('number', function() {
      expect(false).toEqual(changedSinceOptionCreator(10));
    });
    it('object', function() {
      expect(false).toEqual(changedSinceOptionCreator({ a: 'b' }));
    });
    it('array', function() {
      expect(false).toEqual(changedSinceOptionCreator([1, 'minutes']));
    });
    it('0 minutes', function() {
      expect(false).toEqual(changedSinceOptionCreator('0 minutes'));
    });
    it('1 minutes', function() {
      expect(false).toEqual(changedSinceOptionCreator('1 minutes'));
    });
    it('1 hours', function() {
      expect(false).toEqual(changedSinceOptionCreator('1 hours'));
    });
    it('1 days', function() {
      expect(false).toEqual(changedSinceOptionCreator('1 days'));
    });
    it('1 seconds', function() {
      expect(false).toEqual(changedSinceOptionCreator('1 seconds'));
    });
    it('0 seconds', function() {
      expect(false).toEqual(changedSinceOptionCreator('0 seconds'));
    });
  });
});
