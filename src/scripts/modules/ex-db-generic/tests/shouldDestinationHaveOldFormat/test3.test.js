import { createStore } from '../../storeProvisioning';

jest.mock('../../../../modules/components/stores/InstalledComponentsStore', () => {
  const Immutable = require('immutable');
  const data = Immutable.fromJS({
    parameters: {
      tables: [
        {
          outputTable: 'in.c-keboola-ex-db-mysql-custom.test1'
        }
      ]
    }
  });
  return {
    getConfigData: () => {
      return data;
    },
    getLocalState: () => {
      return data;
    },
    getConfigRows: () => {
      return Immutable.fromJS([
        {
          outputTable: 'in.c-keboola-ex-db-mysql.test1'
        }
      ]);
    }
  };
});

const store = createStore('keboola.ex-db-mysql', '333289236222');

describe('shouldDestinationHaveOldFormat test 3', function() {
  describe('shouldDestinationHaveOldFormat', function() {
    it('it should have new format (custom destination)', function() {
      expect(false).toEqual(store.shouldDestinationHaveOldFormat('in.c-keboola-ex-db-mysql'));
    });
  });
});
