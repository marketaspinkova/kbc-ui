import assert from 'assert';
import {fromJS} from 'immutable';
import titleAdpater from './title';

const tableId = 'in.some.table';
function makeParameters(body = {}) {
  return {
    tables: {
      [tableId]: body
    }
  };
}


const casesDefinition = {
  init: {
    localState: {
      tableId: tableId,
      title: tableId,
      identifier: ''
    },
    configuration: {
      parameters: makeParameters({title: tableId, identifier: ''})
    },
    createEmptyConfigurationParams: {
      name: tableId,
      webalizedName: tableId
    }
  }
};


describe('wrgdv3 title adapter tests', () => {
  const casesKeys = Object.keys(casesDefinition);
  casesKeys.forEach(caseName => {
    const {localState, configuration, createEmptyConfigurationParams} = casesDefinition[caseName];
    const parsed = titleAdpater.parseConfiguration(fromJS(configuration));
    const reconstructed = titleAdpater.createConfiguration(parsed);
    it('should test parse of ' + caseName + ' case', () => {
      assert.deepEqual(localState, parsed.toJS());
    });
    it('should test create of ' + caseName + ' case', () => {
      assert.deepEqual(configuration, reconstructed.toJS());
    });

    if (createEmptyConfigurationParams) {
      const {name, webalizedName} = createEmptyConfigurationParams;
      it('should test create empty configuration of ' + caseName + ' case', () => {
        assert.deepEqual(configuration, titleAdpater.createEmptyConfiguration(name, webalizedName).toJS());
      });
    }
  });
});
