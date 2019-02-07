import Immutable from 'immutable';
import getDatatypeLabel from './getDatatypeLabel';

describe('getDatatypeLabel', function() {
  describe('#getDatatypeLabel()', function() {
    it('should return string', function() {
      expect('test').toEqual(getDatatypeLabel('test'));
    });

    it('should return VARCHAR', function() {
      const definition = Immutable.fromJS({
        type: 'VARCHAR'
      });
      expect('VARCHAR').toEqual(getDatatypeLabel(definition));
    });

    it('should return VARCHAR', function() {
      const definition = Immutable.fromJS({
        type: 'VARCHAR',
        length: null,
        compression: null
      });
      expect('VARCHAR').toEqual(getDatatypeLabel(definition));
    });

    it('should return VARCHAR(255)', function() {
      const definition = Immutable.fromJS({
        type: 'VARCHAR',
        length: '255'
      });
      expect('VARCHAR(255)').toEqual(getDatatypeLabel(definition));
    });

    it('should return VARCHAR(255) ENCODE LZO', function() {
      const definition = Immutable.fromJS({
        type: 'VARCHAR',
        length: '255',
        compression: 'LZO'
      });
      expect('VARCHAR(255) ENCODE LZO').toEqual(getDatatypeLabel(definition));
    });
  });
});
