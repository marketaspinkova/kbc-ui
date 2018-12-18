import {parseDataTypeFromString} from './parseDataTypeFromString';
import assert from 'assert';
import {Map} from 'immutable';

describe('parseDataTypeFromString()', () => {
  it('should parse empty string', () => {
    const test = parseDataTypeFromString('', 'columnName').toJS();
    const expected = {
      column: 'columnName',
      type: '',
      length: ''
    };
    assert.deepEqual(test, expected);
  });

  it('should parse string defined data types', () => {
    assert.deepEqual({
      type: 'VARCHAR',
      length: '',
      column: 'name'
    }, parseDataTypeFromString('VARCHAR', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: '',
      column: 'name'
    }, parseDataTypeFromString('NUMBER', 'name').toJS());

    assert.deepEqual({
      type: 'DATE',
      length: '',
      column: 'name'
    }, parseDataTypeFromString('DATE', 'name').toJS());

    assert.deepEqual({
      type: 'BIGINT UNSIGNED',
      length: '',
      column: 'name'
    }, parseDataTypeFromString('BIGINT UNSIGNED', 'name').toJS());
  });
  it('should parse string defined data types with length', () => {
    assert.deepEqual({
      type: 'VARCHAR',
      length: '255',
      column: 'name'
    }, parseDataTypeFromString('VARCHAR (255)', 'name').toJS());

    assert.deepEqual({
      type: 'VARCHAR',
      length: '255',
      column: 'name'
    }, parseDataTypeFromString('VARCHAR(255)', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: '12,2',
      column: 'name'
    }, parseDataTypeFromString('NUMBER (12,2)', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: '12,2',
      column: 'name'
    }, parseDataTypeFromString('NUMBER(12,2)', 'name').toJS());
  });
});
