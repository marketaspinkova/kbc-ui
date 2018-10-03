import assert from 'assert';
import {fromJS} from 'immutable';
import {parseParameters, createConfigParameters} from './rowTableParameters';

const tableId = 'in.some.table';

describe('row table parameters helper test', () => {
  const configuration = fromJS({
    parameters: {
      tables: {
        [tableId]: {
          foo: 'bar'
        }
      }
    }
  });
  const localState = fromJS({
    'tableId': tableId,
    foo: 'bar'
  });
  const parsed = parseParameters(configuration);
  it('should parse parameters', () => {
    assert.deepEqual(parsed.toJS(), localState.toJS());
  });
  it('should create cofig parameters', () => {
    const created = createConfigParameters(localState);
    assert.deepEqual(created.toJS(), configuration.toJS());
  });
});
