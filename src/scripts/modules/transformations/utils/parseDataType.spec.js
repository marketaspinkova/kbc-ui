import {parseDataTypeFromString} from './parseDataType';
import assert from 'assert';

describe('parseDataTypeFromString()', () => {
  it('should parse empty string', () => {
    const test = parseDataTypeFromString('', 'columnName').toJS();
    const expected = {
      column: 'columnName',
      type: '',
      length: null
    };
    assert.deepEqual(test, expected);
  });

  it('should parse string defined data types', () => {
    assert.deepEqual({
      type: 'VARCHAR',
      length: null,
      column: 'name'
    }, parseDataTypeFromString('VARCHAR', 'name').toJS());

    assert.deepEqual({
      type: 'NUMBER',
      length: null,
      column: 'name'
    }, parseDataTypeFromString('NUMBER', 'name').toJS());

    assert.deepEqual({
      type: 'DATE',
      length: null,
      column: 'name'
    }, parseDataTypeFromString('DATE', 'name').toJS());

    assert.deepEqual({
      type: 'BIGINT UNSIGNED',
      length: null,
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
