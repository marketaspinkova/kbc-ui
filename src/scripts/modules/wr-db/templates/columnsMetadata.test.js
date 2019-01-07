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
      { key: 'KBC.datatype.length', value: '16777216' }
    ]
  }
});

function metadataType(column) {
  return { name: column, dbName: column, type: 'varchar', nullable: true, default: '', size: 16777216 };
}

function defaultType(column) {
  return { name: column, dbName: column, type: 'string', nullable: false, default: '', size: '255' };
}

describe('prepareColumnsTypes', function() {
  it('only table with snowflake backend can read metadata, default values is returned for others backend', () => {
    const fakeMysqlTable = table.setIn(['bucket', 'backend'], 'mysql');

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, fakeMysqlTable),
      fromJS([defaultType('country'), defaultType('cars')])
    );
  });

  it('snowflake backend can read metadata, default values is returned for columns without metadata', () => {
    const expected = fromJS([metadataType('country'), defaultType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, table), expected);
  });

  it('if metadata has no basetype, default values are returned', () => {
    const withoutMetadataBasetype = table.deleteIn(['columnMetadata', 'country', 0]);
    const expected = fromJS([defaultType('country'), defaultType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, withoutMetadataBasetype), expected);
  });

  it('if metadata has unknown basetype, default values are returned', () => {
    const uknownMetadataBasetype = table.setIn(['columnMetadata', 'country', 0, 'value'], 'UNKNOWN');
    const expected = fromJS([defaultType('country'), defaultType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, uknownMetadataBasetype), expected);
  });

  it('if length value from metadata is bigger than allowed, default size is used', () => {
    const updatedTable = table.setIn(['columnMetadata', 'country', 3, 'value'], 26777216);
    const expected = fromJS([metadataType('country'), defaultType('cars')]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, updatedTable), expected);
  });

  it('can read and set default value from metadata', () => {
    const updatedTable = table.updateIn(['columnMetadata', 'country'], metadata => {
      return metadata.push(fromJS({ key: 'KBC.datatype.default', value: 'default value' }));
    });
    const expected = fromJS([
      {
        ...metadataType('country'),
        default: 'default value'
      },
      defaultType('cars')
    ]);

    assert.deepStrictEqual(prepareColumnsTypes(SnowflakeComponentId, updatedTable), expected);
  });
});
