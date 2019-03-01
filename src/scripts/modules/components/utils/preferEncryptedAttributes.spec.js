import preferEncryptedAttributes from './preferEncryptedAttributes';

describe('preferEncryptedAttributes', function() {
  describe('#preferEncryptedAttributes()', function() {
    it('should return scalar when scalar', function() {
      expect('test').toEqual(preferEncryptedAttributes('test'));
    });

    it('should return only encrypted key', function() {
      expect(preferEncryptedAttributes({
        'key1': 'val1',
        '#key1': 'val2'
      })).toEqual({
        '#key1': 'val2'
      });
    });

    it('should return only encrypted key in array', function() {
      expect(preferEncryptedAttributes([
        {
          'key1': 'val1',
          '#key1': 'val2'
        }
      ])).toEqual([
        {
          '#key1': 'val2'
        }
      ]);
    });

    it('should return only encrypted key in nested object', function() {
      expect(preferEncryptedAttributes({
        'key2': {
          'key1': 'val1',
          '#key1': 'val2'
        }
      })).toEqual({
        'key2': {
          '#key1': 'val2'
        }
      });
    });

    it('should return only encrypted key in array nested', function() {
      expect(preferEncryptedAttributes([
        {
          'key2': {
            'key1': 'val1',
            '#key1': 'val2'
          }
        }
      ])).toEqual([
        {
          'key2': {
            '#key1': 'val2'
          }
        }
      ]);
    });

    it('should replace by plain value if encrypted key is empty string', function() {
      expect(preferEncryptedAttributes({
        'key1': 'val2',
        '#key1': ''
      })).toEqual({
        '#key1': 'val2'
      });
    });

    it('should replace by plain value if encrypted key is null', function() {
      expect(preferEncryptedAttributes({
        'key1': 'val2',
        '#key1': null
      })).toEqual({
        '#key1': 'val2'
      });
    });

    // multiple
    it('should return only encrypted keys', function() {
      expect(preferEncryptedAttributes({
        'key1': 'val1',
        '#key1': 'val2',
        'key2': 'val3',
        '#key2': 'val4'
      })).toEqual({
        '#key1': 'val2',
        '#key2': 'val4'
      });
    });

    // multiple nested
    it('should return only encrypted key in nested object', function() {
      expect(preferEncryptedAttributes({
        'key2': {
          'key1': 'val1',
          '#key1': 'val2'
        },
        'key3': 'val3',
        '#key3': 'val4',
        'key4': {
          'key5': 'val5',
          '#key5': 'val6'
        },
        'key5': {
          'key5': 'val5',
          '#key5': 'val6'
        },
        '#key5': 'val7'
      })).toEqual({
        'key2': {
          '#key1': 'val2'
        },
        '#key3': 'val4',
        'key4': {
          '#key5': 'val6'
        },
        '#key5': 'val7'
      });
    });
  });
});
