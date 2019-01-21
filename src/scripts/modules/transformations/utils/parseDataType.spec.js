import { parseDataTypeFromString } from './parseDataType';

describe('parseDataTypeFromString()', () => {
  it('should parse empty string', () => {
    const test = parseDataTypeFromString('', 'columnName').toJS();
    const expected = {
      column: 'columnName',
      type: '',
      length: null
    };
    expect(expected).toEqual(test);
  });

  it('should parse string defined data types', () => {
    expect({
      type: 'VARCHAR',
      length: null,
      column: 'name'
    }).toEqual(parseDataTypeFromString('VARCHAR', 'name').toJS());

    expect({
      type: 'NUMBER',
      length: null,
      column: 'name'
    }).toEqual(parseDataTypeFromString('NUMBER', 'name').toJS());

    expect({
      type: 'DATE',
      length: null,
      column: 'name'
    }).toEqual(parseDataTypeFromString('DATE', 'name').toJS());

    expect({
      type: 'BIGINT UNSIGNED',
      length: null,
      column: 'name'
    }).toEqual(parseDataTypeFromString('BIGINT UNSIGNED', 'name').toJS());
  });
  it('should parse string defined data types with length', () => {
    expect({
      type: 'VARCHAR',
      length: '255',
      column: 'name'
    }).toEqual(parseDataTypeFromString('VARCHAR (255)', 'name').toJS());

    expect({
      type: 'VARCHAR',
      length: '255',
      column: 'name'
    }).toEqual(parseDataTypeFromString('VARCHAR(255)', 'name').toJS());

    expect({
      type: 'NUMBER',
      length: '12,2',
      column: 'name'
    }).toEqual(parseDataTypeFromString('NUMBER (12,2)', 'name').toJS());

    expect({
      type: 'NUMBER',
      length: '12,2',
      column: 'name'
    }).toEqual(parseDataTypeFromString('NUMBER(12,2)', 'name').toJS());
  });
});
