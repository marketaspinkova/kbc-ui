import { fromJS, List } from 'immutable';
import { prepareColumnsTypes } from './columnsMetadata';

const SnowflakeComponentId = 'keboola.wr-db-snowflake';
const table = fromJS({
  bucket: {
    backend: 'snowflake'
  },
  columns: ['country', 'cars'],
  columnMetadata: {
    country: [
      { key: 'KBC.datatype.basetype', value: 'STRING' },
      { key: 'KBC.datatype.type', value: 'TEXT' },
      { key: 'KBC.datatype.nullable', value: '1' },
      { key: 'KBC.datatype.length', value: '16777216' },
      { key: 'KBC.datatype.default', value: 'value' }
    ]
  }
});

function metadataSnowflakeType(column) {
  return { name: column, dbName: column, type: 'varchar', nullable: true, default: 'value', size: '16777216' };
}

function defaultSnowflakeType(column) {
  return { name: column, dbName: column, type: 'string', nullable: false, default: '', size: '255' };
}

function defaultMysqlType(column) {
  return { name: column, dbName: column, type: 'TEXT', nullable: false, default: '', size: '' };
}

describe('prepareColumnsTypes', function() {
  it('it return empty list for unknown componentId', () => {
    expect(List()).toEqual(prepareColumnsTypes('keboola.wr-db-unknown', table));
  });

  it('only table with snowflake backend can read metadata, default values is returned for others backend', () => {
    expect(prepareColumnsTypes('keboola.wr-db-mysql', table)).toEqual(fromJS([defaultMysqlType('country'), defaultMysqlType('cars')]));
  });

  it('snowflake backend can read metadata, default values is returned for columns without metadata', () => {
    const expected = fromJS([metadataSnowflakeType('country'), defaultSnowflakeType('cars')]);
    expect(expected).toEqual(prepareColumnsTypes(SnowflakeComponentId, table));
  });

  it('if metadata has no basetype, default values are returned', () => {
    const withoutMetadataBasetype = table.deleteIn(['columnMetadata', 'country', 0]);
    const expected = fromJS([defaultSnowflakeType('country'), defaultSnowflakeType('cars')]);
    expect(expected).toEqual(prepareColumnsTypes(SnowflakeComponentId, withoutMetadataBasetype));
  });

  it('if metadata has unknown basetype, default values are returned', () => {
    const uknownMetadataBasetype = table.setIn(['columnMetadata', 'country', 0, 'value'], 'UNKNOWN');
    const expected = fromJS([defaultSnowflakeType('country'), defaultSnowflakeType('cars')]);
    expect(expected).toEqual(prepareColumnsTypes(SnowflakeComponentId, uknownMetadataBasetype));
  });

  it('user defined metadata is preferred over system defined metadata', () => {
    const updatedTable = table.setIn(['columnMetadata', 'country'], fromJS([
      { key: 'KBC.datatype.basetype', value: 'STRING', provider: 'system' },
      { key: 'KBC.datatype.type', value: 'TEXT', provider: 'system' },
      { key: 'KBC.datatype.nullable', value: '1', provider: 'system' },
      { key: 'KBC.datatype.length', value: '16777216', provider: 'system' },
      { key: 'KBC.datatype.default', value: 'value', provider: 'system' },
      { key: 'KBC.datatype.basetype', value: 'INTEGER', provider: 'user' },
      { key: 'KBC.datatype.type', value: 'INTEGER', provider: 'user' },
      { key: 'KBC.datatype.nullable', value: '0', provider: 'user' },
      { key: 'KBC.datatype.length', value: '10,2', provider: 'user' },
      { key: 'KBC.datatype.default', value: '30', provider: 'user' },
    ]));
    const expectedMetadata = { name: 'country', dbName: 'country', type: 'integer', nullable: false, default: '30', size: '10,2' };
    const expected = fromJS([expectedMetadata, defaultSnowflakeType('cars')]);
    expect(prepareColumnsTypes(SnowflakeComponentId, updatedTable)).toEqual(expected);
  });
});
