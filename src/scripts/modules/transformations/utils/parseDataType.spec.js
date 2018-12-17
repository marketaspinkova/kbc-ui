import parseDataType from './parseDataType';
import assert from 'assert';
import {Map} from 'immutable';

describe('parseDataType()', () => {
  it('should parse empty string', () => {
    const test = parseDataType('', 'columnName').toJS();
    const expected = {
      column: 'columnName',
      type: '',
      length: ''
    };
    assert.deepEqual(test, expected);
  });

  it('should return input if is Immutable.Map', () => {
    const testMap1 = Map({});
    const testMap2 = Map({type: 'VARCHAR'});
    const testMap3 = Map({type: 'NUMBER'});
    assert.deepEqual(testMap1.toJS(), parseDataType(testMap1, 'foo').toJS());
    assert.deepEqual(testMap2.toJS(), parseDataType(testMap2, 'foo').toJS());
    assert.deepEqual(testMap3.toJS(), parseDataType(testMap3, 'foo').toJS());
  });

  it('should parse string defined data types', () => {
    assert.deepEqual({
      type: 'VARCHAR',
      length: '',
      column: 'name'
    }, parseDataType('VARCHAR', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: '',
      column: 'name'
    }, parseDataType('NUMBER', 'name').toJS());

    assert.deepEqual({
      type: 'DATE',
      length: '',
      column: 'name'
    }, parseDataType('DATE', 'name').toJS());
  });
  it('should parse string defined data types with length', () => {
    assert.deepEqual({
      type: 'VARCHAR',
      length: '255',
      column: 'name'
    }, parseDataType('VARCHAR (255)', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: '12,2',
      column: 'name'
    }, parseDataType('NUMBER (12,2)', 'name').toJS());
  });
});
