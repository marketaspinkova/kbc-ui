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

function defaultCountryTypesFromMetadata() {
  return { name: 'country', dbName: 'country', type: 'varchar', nullable: true, default: '', size: 16777216 };
}

function snowflakeDefault(column) {
  return { name: column, dbName: column, type: 'string', nullable: false, default: '', size: '255' };
}

describe('prepareColumnsTypes', function() {
  it('snowflake backend can read metadata, default values is returned for columns without metadata', () => {
    const expected = fromJS([defaultCountryTypesFromMetadata(), snowflakeDefault('cars')]);

    assert.strictEqual(prepareColumnsTypes(SnowflakeComponentId, table).equals(expected), true);
  });

  it('if metadata has no basetype, default values are returned', () => {
    const withoutMetadataBasetype = table.deleteIn(['columnMetadata', 'country', 0]);
    const expected = fromJS([snowflakeDefault('country'), snowflakeDefault('cars')]);

    assert.strictEqual(prepareColumnsTypes(SnowflakeComponentId, withoutMetadataBasetype).equals(expected), true);
  });

  it('if metadata has unknown basetype, default values are returned', () => {
    const uknownMetadataBasetype = table.setIn(['columnMetadata', 'country', 0, 'value'], 'UNKNOWN');
    const expected = fromJS([snowflakeDefault('country'), snowflakeDefault('cars')]);

    assert.strictEqual(prepareColumnsTypes(SnowflakeComponentId, uknownMetadataBasetype).equals(expected), true);
  });

  it('if length from metadata is bigger than allowed, default size is used', () => {
    const updatedTable = table.setIn(['columnMetadata', 'country', 3, 'value'], 26777216);
    const expected = fromJS([defaultCountryTypesFromMetadata(), snowflakeDefault('cars')]);

    assert.strictEqual(prepareColumnsTypes(SnowflakeComponentId, updatedTable).equals(expected), true);
  });

  it('disabled fields should be excluded', () => {
    const expectedCountry = defaultCountryTypesFromMetadata();
    delete expectedCountry.nullable;
    delete expectedCountry.default;

    const expectedCars = {
      ...snowflakeDefault('cars'),
      type: 'varchar'
    };
    delete expectedCars.nullable;
    delete expectedCars.default;

    const expected = fromJS([expectedCountry, expectedCars]);

    assert.strictEqual(prepareColumnsTypes('keboola.wr-thoughtspot', table).equals(expected), true);
  });

  it('can read default value from metadata', () => {
    const updatedTable = table.updateIn(['columnMetadata', 'country'], metadata => {
      return metadata.push(fromJS({ key: 'KBC.datatype.default', value: 'default value' }));
    });
    const expected = fromJS([
      {
        ...defaultCountryTypesFromMetadata(),
        default: 'default value'
      },
      snowflakeDefault('cars')
    ]);

    assert.strictEqual(prepareColumnsTypes(SnowflakeComponentId, updatedTable).equals(expected), true);
  });
});
