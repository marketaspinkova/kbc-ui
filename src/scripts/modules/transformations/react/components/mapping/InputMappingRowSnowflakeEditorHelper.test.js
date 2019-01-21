import { getMetadataDataTypes } from './InputMappingRowSnowflakeEditorHelper';
import { fromJS } from 'immutable';

describe('getMetadataDataType', function() {
  it('should not break on empty input', function() {
    expect(fromJS({})).toEqual(getMetadataDataTypes(fromJS({})));
  });

  it('should return null with KBC.datatype.length only (no base type)', function() {
    expect(fromJS({
      Price: null
    })).toEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349672',
          key: 'KBC.datatype.length',
          value: '19,4',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })));
  });

  it('should return null with KBC.datatype.nullable only (no base type)', function() {
    expect(fromJS({
      Price: null
    })).toEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349670',
          key: 'KBC.datatype.nullable',
          value: '1',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })));
  });

  it('should work with KBC.datatype.basetype only', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: false
      }
    })).toEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })));
  });

  it('should return null for nonexistent KBC.datatype.basetype', function() {
    expect(fromJS({
      Price: null
    })).toEqual(getMetadataDataTypes(fromJS({
      Price: [
        {
          id: '85349671',
          key: 'KBC.datatype.basetype',
          value: 'NONEXISTENT_TYPE',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    })));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: true
      }
    })).toEqual(getMetadataDataTypes(fromJS({
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
    })));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable (nullable set to 0)', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: null,
        convertEmptyValuesToNull: false
      }
    })).toEqual(getMetadataDataTypes(fromJS({
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
    })));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'NUMBER',
        length: '19,4',
        convertEmptyValuesToNull: false
      }
    })).toEqual(getMetadataDataTypes(fromJS({
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
    })));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length (should keep the length)', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'VARCHAR',
        length: '123',
        convertEmptyValuesToNull: false
      }
    })).toEqual(getMetadataDataTypes(fromJS({
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
    })));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length (should decrease length)', function() {
    expect(fromJS({
      Price: {
        column: 'Price',
        type: 'VARCHAR',
        length: 16777216,
        convertEmptyValuesToNull: false
      }
    })).toEqual(getMetadataDataTypes(fromJS({
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
    })));
  });
});
