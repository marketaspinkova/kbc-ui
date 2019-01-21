import Immutable from 'immutable';
import * as legacyUIMigration from './legacyUIMigration';

describe('legacyUIMigration', function() {
  describe('isMigrated()', function() {
    it('should return a true for a migrated config', function() {
      expect(true).toEqual(legacyUIMigration.isMigrated(Immutable.fromJS({
        configuration: {
          parameters: {
            loginname: '',
            '#password': '',
            '#securitytoken': '',
            'sandbox': ''
          }
        }
      })));
    });
    it('should return false for a config with objects key', function() {
      expect(false).toEqual(legacyUIMigration.isMigrated(Immutable.fromJS({
        configuration: {
          parameters: {
            objects: []
          }
        }
      })));
    });
    it('should return false for a config with sinceLast key', function() {
      expect(false).toEqual(legacyUIMigration.isMigrated(Immutable.fromJS({
        configuration: {
          parameters: {
            sinceLast: false
          }
        }
      })));
    });
  });

  describe('getRootConfiguration()', function() {
    it('should return correct defaults for an empty config', function() {
      const expected = {
        parameters: {
          loginname: '',
          '#password': '',
          '#securitytoken': '',
          sandbox: false
        }
      };
      expect(expected).toEqual(legacyUIMigration.getRootConfiguration(Immutable.fromJS({configuration: {}})).toJS());
    });
    it('should return correct config for a populated config', function() {
      const configuration = {
        configuration: {
          parameters: {
            loginname: 'a',
            '#password': 'b',
            '#securitytoken': 'c',
            sandbox: true,
            sinceLast: true,
            objects: []
          }
        }
      };
      const expected = {
        parameters: {
          loginname: 'a',
          '#password': 'b',
          '#securitytoken': 'c',
          sandbox: true
        }
      };
      expect(expected).toEqual(legacyUIMigration.getRootConfiguration(Immutable.fromJS(configuration)).toJS());
    });
  });

  describe('getRootState()', function() {
    it('should return empty state defaults for an empty state', function() {
      expect({}).toEqual(legacyUIMigration.getRootState(Immutable.fromJS({state: {}})).toJS());
    });
    it('should return correct value for a populated state', function() {
      const configuration = {
        state: {key: 'val'}
      };
      expect(configuration.state).toEqual(legacyUIMigration.getRootState(Immutable.fromJS(configuration)).toJS());
    });
  });

  describe('getRowsCount()', function() {
    it('should return 0 for missing objects prop', function() {
      expect(0).toEqual(legacyUIMigration.getRowsCount(Immutable.fromJS({configuration: {}})));
    });
    it('should return 0 for empty objects prop', function() {
      expect(0).toEqual(legacyUIMigration.getRowsCount(Immutable.fromJS({configuration: {parameters: {objects: []}}})));
    });
    it('should return 2 for 2 objects', function() {
      expect(2).toEqual(legacyUIMigration.getRowsCount(Immutable.fromJS({configuration: {parameters: {objects: [{}, {}]}}})));
    });
  });


  describe('getRowName()', function() {
    it('should return correct defaults for a missing name', function() {
      const configuration = {
        configuration: {
          parameters: {
            objects: [{}, {}]
          }
        }
      };
      expect('Unknown object').toEqual(legacyUIMigration.getRowName(Immutable.fromJS(configuration), 0));
      expect('Unknown object').toEqual(legacyUIMigration.getRowName(Immutable.fromJS(configuration), 1));
    });
    it('should return correct name for a populated config', function() {
      const configuration = {
        configuration: {
          parameters: {
            objects: [
              {
                name: 'Account',
                soql: ''
              },
              {
                name: 'User',
                soql: 'SELECT Id, Name FROM User'
              }
            ]
          }
        }
      };
      expect('Account').toEqual(legacyUIMigration.getRowName(Immutable.fromJS(configuration), 0));
      expect('User').toEqual(legacyUIMigration.getRowName(Immutable.fromJS(configuration), 1));
    });
  });

  describe('getRowConfiguration()', function() {
    it('should return correct defaults for an empty config', function() {
      const configuration = {
        configuration: {
          parameters: {
            objects: [{}, {}]
          }
        }
      };
      const expected = {
        parameters: {
          sinceLast: false,
          objects: [
            {
              name: '',
              soql: ''
            }
          ]
        }
      };
      expect(expected).toEqual(legacyUIMigration.getRowConfiguration(Immutable.fromJS(configuration), 0).toJS());
      expect(expected).toEqual(legacyUIMigration.getRowConfiguration(Immutable.fromJS(configuration), 1).toJS());
    });
    it('should return correct config for a populated config', function() {
      const configuration = {
        configuration: {
          parameters: {
            sinceLast: true,
            objects: [
              {
                name: 'Account',
                soql: ''
              },
              {
                name: 'User',
                soql: 'SELECT Id, Name FROM User'
              }
            ]
          }
        }
      };
      const expected0 = {
        parameters: {
          sinceLast: true,
          objects: [
            {
              name: 'Account',
              soql: ''
            }
          ]
        }
      };
      const expected1 = {
        parameters: {
          sinceLast: true,
          objects: [
            {
              name: 'User',
              soql: 'SELECT Id, Name FROM User'
            }
          ]
        }
      };
      expect(expected0).toEqual(legacyUIMigration.getRowConfiguration(Immutable.fromJS(configuration), 0).toJS());
      expect(expected1).toEqual(legacyUIMigration.getRowConfiguration(Immutable.fromJS(configuration), 1).toJS());
    });
  });

  describe('getRowState()', function() {
    it('should return empty state defaults for an empty state', function() {
      expect({}).toEqual(legacyUIMigration.getRowState(Immutable.fromJS({state: {}}), 0).toJS());
      expect({}).toEqual(legacyUIMigration.getRowState(Immutable.fromJS({state: {}}), 1).toJS());
    });
    it('should return correct value for a populated state', function() {
      const configuration = {
        state: {key: 'val'}
      };
      expect(configuration.state).toEqual(legacyUIMigration.getRowState(Immutable.fromJS(configuration), 0).toJS());
      expect(configuration.state).toEqual(legacyUIMigration.getRowState(Immutable.fromJS(configuration), 1).toJS());
    });
  });
});
