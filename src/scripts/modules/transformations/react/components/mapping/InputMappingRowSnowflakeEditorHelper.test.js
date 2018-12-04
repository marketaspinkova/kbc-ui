import assert from 'assert';
import { getMetadataDataTypes } from './InputMappingRowSnowflakeEditorHelper';
import { fromJS } from 'immutable';

describe('getMetadataDataType', function() {
  it('should not break on empty input', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({})), fromJS({}));
  });

  it('should return null with KBC.datatype.length only (no base type)', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349672',
          key: 'KBC.datatype.length',
          value: '19,4',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: null
    }));
  });

  it('should return null with KBC.datatype.nullable only (no base type)', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349670',
          key: 'KBC.datatype.nullable',
          value: '1',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: null
    }));
  });

  it('should work with KBC.datatype.basetype only', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: false
      }
    }));
  });

  it('should work with random KBC.datatype.basetype', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'RANDOM',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: null,
        length: null,
        convertEmptyValuesToNull: false
      }
    }));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
        {
          id: '85349670',
          key: 'KBC.datatype.nullable',
          value: '1',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: true
      }
    }));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable (nullable set to 0)', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
        {
          id: '85349670',
          key: 'KBC.datatype.nullable',
          value: '0',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: false
      }
    }));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
        {
          id: '85349672',
          key: 'KBC.datatype.length',
          value: '19,4',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: '19,4',
        convertEmptyValuesToNull: false
      }
    }));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length (should keep the length)', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349679',
          key: 'KBC.datatype.basetype',
          value: 'STRING',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
        {
          id: '85349680',
          key: 'KBC.datatype.length',
          value: '123',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'VARCHAR',
        length: '123',
        convertEmptyValuesToNull: false
      }
    }));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length (should decrease length)', function() {
    assert.deepStrictEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349679',
          key: 'KBC.datatype.basetype',
          value: 'STRING',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
        {
          id: '85349680',
          key: 'KBC.datatype.length',
          value: '2147483647',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })), fromJS({
      Price: {
        column: 'Price',
        type: 'VARCHAR',
        length: 16777216,
        convertEmptyValuesToNull: false
      }
    }));
  });
});
