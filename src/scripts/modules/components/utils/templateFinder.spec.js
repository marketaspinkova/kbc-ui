import Immutable from 'immutable';
import templateFinder from './templateFinder';

var templates = Immutable.fromJS([
  {
    'data': {
      'boolKey': true,
      'objectKey': {
        'key1': 'val1',
        'key2': [1, 2, 3]
      },
      'arrayKey': [
        {
          'key1': 'val1'
        },
        {
          'key2': {
            'key3': 'val3'
          }
        }
      ]
    }
  },
  {
    'data': {
      'boolKey': false,
      'objectKey': {},
      'arrayKey': []
    }
  }
]);

describe('templateFinder', function() {
  describe('#templateFinder()', function() {
    it('should return 0 templates on empty config', function() {
      var config = Immutable.Map();
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on config with no matching keys', function() {
      var config = Immutable.fromJS({'someotherKey': false});
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on config with one matching key (of three)', function() {
      var config = Immutable.fromJS({'boolKey': true});
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 1 templates on match', function() {
      var config = Immutable.fromJS({
        'boolKey': false,
        'objectKey': {},
        'arrayKey': []
      });
      expect(1).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on type mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': 0,
        'objectKey': {},
        'arrayKey': []
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on type mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': false,
        'objectKey': [],
        'arrayKey': []
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on type mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': false,
        'objectKey': {},
        'arrayKey': {}
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 1 templates on deep match', function() {
      var config = Immutable.fromJS({
        'boolKey': true,
        'objectKey': {
          'key1': 'val1',
          'key2': [1, 2, 3]
        },
        'arrayKey': [
          {
            'key1': 'val1'
          },
          {
            'key2': {
              'key3': 'val3'
            }
          }
        ]
      });
      expect(1).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on deep mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': true,
        'objectKey': {
          'key1': 'val1',
          'key2': [1, 2, 4]
        },
        'arrayKey': [
          {
            'key1': 'val1'
          },
          {
            'key2': {
              'key3': 'val3'
            }
          }
        ]
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on deep mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': true,
        'objectKey': {
          'key1': 'val1',
          'key2': [1, 2, 3]
        },
        'arrayKey': [
          {
            'key1': 'val1'
          },
          {
            'key2': {
              'key3': 'val4'
            }
          }
        ]
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });

    it('should return 0 templates on deep mismatch', function() {
      var config = Immutable.fromJS({
        'boolKey': true,
        'objectKey': {
          'key1': 'val1',
          'key2': [1, 2, 3]
        },
        'arrayKey': [
          {
            'key1': 'val1'
          },
          {
            'key2': {
              'key4': 'val3'
            }
          }
        ]
      });
      expect(0).toEqual(templateFinder(templates, config).count());
    });
  });
});
