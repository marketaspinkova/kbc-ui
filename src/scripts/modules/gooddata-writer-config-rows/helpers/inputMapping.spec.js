import assert from 'assert';
import {parseInputMapping, createInputMapping} from './inputMapping';
import {fromJS} from 'immutable';


describe('test input mapping helper', () => {
  const configuration = fromJS({
    storage: {
      input: {
        tables: [
          {source: 'some.table'}
        ]
      }
    }
  });

  const localState = fromJS({source: 'some.table'});
  const parsed = parseInputMapping(configuration);
  it('should test parse empty input mapping', () => {
    assert.deepEqual(parseInputMapping(fromJS({})).toJS(), {});
  });

  it('should test parse nonempty input mapping', () => {
    assert.deepEqual(parsed.toJS(), localState.toJS());
  });

  it('should test create nonempty input mapping', () => {
    const created = createInputMapping(localState);
    assert.deepEqual(created.toJS(), configuration.toJS());
  });
});
