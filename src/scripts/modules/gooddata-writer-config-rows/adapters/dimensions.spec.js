import assert from 'assert';
import {fromJS} from 'immutable';
import dimensions from './dimensions';

const casesDefinition = {
  empty: {
    localState: {
      dimensions: {}
    },
    configuration: {
      parameters: {
        dimensions: {
        }
      }
    }
  },

  someDimensions: {
    localState: {
      dimensions: {
        a: {identifier: 'a'}
      }
    },
    configuration: {
      parameters: {
        dimensions: {
          a: {identifier: 'a'}
        }
      }
    }
  }

};

describe('dimensions adapter tests', () => {
  const casesKeys = Object.keys(casesDefinition);
  casesKeys.forEach(caseName => {
    const {localState, configuration, configurationToCreate} = casesDefinition[caseName];
    const parsed = dimensions.parseConfiguration(fromJS(configuration));
    const reconstructed = dimensions.createConfiguration(parsed);
    it('should test parse of ' + caseName + ' case', () => {
      assert.deepEqual(localState, parsed.toJS());
    });
    it('should test create of ' + caseName + ' case', () => {
      assert.deepEqual(configurationToCreate || configuration, reconstructed.toJS());
    });
  });
});
