import validateStorageTableId from './validateStorageTableId';

describe('validateStorageTableId', function() {
  describe('#validateStorageTableId()', function() {
    it('should return false on empty string', function() {
      expect(false).toEqual(validateStorageTableId(''));
    });
    it('should return false on sys bucket', function() {
      expect(false).toEqual(validateStorageTableId('sys.c-whatever.table'));
    });
    it('should return false on missing table part', function() {
      expect(false).toEqual(validateStorageTableId('in.c-data.'));
    });
    it('should return false on invalid character in table part', function() {
      expect(false).toEqual(validateStorageTableId('in.c-data.#'));
    });
    it('should return false on invalid prefix', function() {
      expect(false).toEqual(validateStorageTableId('in.x-data.abc'));
    });
    it('should return true on valid in bucket table', function() {
      expect(true).toEqual(validateStorageTableId('in.c-data.abc'));
    });
    it('should return true on valid out bucket table', function() {
      expect(true).toEqual(validateStorageTableId('out.c-data.abc'));
    });
  });
});
