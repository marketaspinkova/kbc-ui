import assert from 'assert';
import { fromJS } from 'immutable';
import { prepareColumnsTypes } from './columnsMetadata';

const SnowflakeComponentId = 'keboola.wr-db-snowflake';
const snowFlakeTable = fromJS({
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

function defaultCountryTypesFromMetadata() {
  return { name: 'country', dbName: 'country', type: 'varchar', nullable: true, default: '', size: 16777216 };
}

function snowflakeDefault(column) {
  return { name: column, dbName: column, type: 'string', nullable: false, default: '', size: '255' };
}

describe('prepareColumnsTypes', function() {
  it('only table with snowflake backend can read metadata, default values is returned for others backend', () => {
    const fakeMysqlTable = snowFlakeTable.setIn(['bucket', 'backend'], 'mysql');

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, fakeMysqlTable),
      fromJS([snowflakeDefault('country'), snowflakeDefault('cars')])
    );
  });

  it('snowflake backend can read metadata, default values is returned for columns without metadata', () => {
    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, snowFlakeTable),
      fromJS([defaultCountryTypesFromMetadata(), snowflakeDefault('cars')])
    );
  });

  it('if metadata has no basetype, default values are returned', () => {
    const withoutMetadataBasetype = snowFlakeTable.deleteIn(['columnMetadata', 'country', 0]);

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, withoutMetadataBasetype),
      fromJS([snowflakeDefault('country'), snowflakeDefault('cars')])
    );
  });

  it('if metadata has unknown basetype, default values are returned', () => {
    const uknownMetadataBasetype = snowFlakeTable.setIn(['columnMetadata', 'country', 0, 'value'], 'UNKNOWN');

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, uknownMetadataBasetype),
      fromJS([snowflakeDefault('country'), snowflakeDefault('cars')])
    );
  });

  it('if length from metadata is bigger than allowed, default size is used', () => {
    const updatedTable = snowFlakeTable.setIn(['columnMetadata', 'country', 3, 'value'], 26777216);

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, updatedTable),
      fromJS([defaultCountryTypesFromMetadata(), snowflakeDefault('cars')])
    );
  });

  it('can read default value from metadata', () => {
    const updatedTable = snowFlakeTable.updateIn(['columnMetadata', 'country'], metadata => {
      return metadata.push(fromJS({ key: 'KBC.datatype.default', value: 'default value' }));
    });

    assert.deepStrictEqual(
      prepareColumnsTypes(SnowflakeComponentId, updatedTable),
      fromJS([
        {
          ...defaultCountryTypesFromMetadata(),
          default: 'default value'
        },
        snowflakeDefault('cars')
      ])
    );
  });
});
