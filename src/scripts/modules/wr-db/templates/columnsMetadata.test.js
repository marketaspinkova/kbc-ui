import assert from 'assert';
import { fromJS } from 'immutable';
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
  return { name: column, dbName: column, type: 'varchar', nullable: true, default: 'value', size: 16777216 };
}

function defaultSnowflakeType(column) {
  return { name: column, dbName: column, type: 'string', nullable: false, default: '', size: '255' };
}

function defaultMysqlType(column) {
  return { name: column, dbName: column, type: 'TEXT', nullable: false, default: '', size: '' };
}

describe('prepareColumnsTypes', function() {
  it('it return null for unknown componentId', () => {
    assert.equal(prepareColumnsTypes('keboola.wr-db-unknown', table), null);
  });

  it('only table with snowflake backend can read metadata, default values is returned for others backend', () => {
    assert.deepStrictEqual(
      prepareColumnsTypes('keboola.wr-db-mysql', table),
      fromJS([defaultMysqlType('country'), defaultMysqlType('cars')])
    );
  });

  it('snowflake backend can read metadata, default values is returned for columns without metadata', () => {
    const expected = fromJS([metadataSnowflakeType('country'), defaultSnowflakeType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, table), expected);
  });

  it('if metadata has no basetype, default values are returned', () => {
    const withoutMetadataBasetype = table.deleteIn(['columnMetadata', 'country', 0]);
    const expected = fromJS([defaultSnowflakeType('country'), defaultSnowflakeType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, withoutMetadataBasetype), expected);
  });

  it('if metadata has unknown basetype, default values are returned', () => {
    const uknownMetadataBasetype = table.setIn(['columnMetadata', 'country', 0, 'value'], 'UNKNOWN');
    const expected = fromJS([defaultSnowflakeType('country'), defaultSnowflakeType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, uknownMetadataBasetype), expected);
  });

  it('if length value from metadata is bigger than allowed, default size is used', () => {
    const updatedTable = table.setIn(['columnMetadata', 'country', 3, 'value'], 26777216);
    const expected = fromJS([metadataSnowflakeType('country'), defaultSnowflakeType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, updatedTable), expected);
  });
});
