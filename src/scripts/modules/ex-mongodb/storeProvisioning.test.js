import { Map } from 'immutable';
import { isJsonValid, isMappingValid, isValidQuery } from './storeProvisioning';

describe('mongodb export validation', function() {
  describe('validate json', function() {
    it('should return that json is valid for: {"a": "b"} ', function() {
      expect(true).toEqual(isJsonValid('{"a": "b"}'));
    });
    it('should return that json is not valid for: {"a": "b}', function() {
      expect(false).toEqual(isJsonValid('{"a": "b}'));
    });
    it('should return that json is not valid for: (empty string)', function() {
      expect(false).toEqual(isJsonValid(''));
    });
    it('should return that json is not valid', function() {
      expect(false).toEqual(isJsonValid(null));
    });
    it('should return that json is not valid', function() {
      expect(false).toEqual(isJsonValid());
    });
  });

  describe('validate mapping', function() {
    it('should return that mapping is valid for: {"a": "b"}', function() {
      expect(true).toEqual(isMappingValid('{"a": "b"}'));
    });
    it('should return that mapping is valid for Map({"a": "b"})', function() {
      expect(true).toEqual(isMappingValid(Map({'a': 'b'})));
    });
    it('should return that mapping is not valid for: {"a": "b}', function() {
      expect(false).toEqual(isMappingValid('{"a": "b}'));
    });
    it('should return that mapping is not valid for: (empty string)', function() {
      expect(false).toEqual(isMappingValid(''));
    });
  });

  describe('validate whole export', function() {
    it('should return that mapping is valid for Map({"name": "b", "collection": "b", "mode": "raw"})', function() {
      expect(true).toEqual(isValidQuery(Map({'name': 'b', 'collection': 'b', 'mode': 'raw'})));
    });
    it('should return that mapping is valid for Map({"name": "b", "collection": "b", "mapping": Map({"a": "b"})})', function() {
      expect(true).toEqual(isValidQuery(Map({'name': 'b', 'collection': 'b', 'mapping': Map({'a': 'b'})})));
    });
    it('should return that mapping is valid for Map({"name": "b", "collection": "b", "mapping": \'{"a": "b"}\'})', function() {
      expect(true).toEqual(isValidQuery(Map({'name': 'b', 'collection': 'b', 'mapping': '{"a": "b"}'})));
    });
    it('should return that mapping is not valid for Map({"name": "b", "collection": "b"})', function() {
      expect(false).toEqual(isValidQuery(Map({'name': 'b', 'collection': 'b'})));
    });
  });
});
