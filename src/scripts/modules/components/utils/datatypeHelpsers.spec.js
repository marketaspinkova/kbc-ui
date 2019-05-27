import { getDataType, isNullable } from './datatypeHelpers';
import { fromJS } from 'immutable';
import { DataTypeKeys } from '../MetadataConstants';

describe('getDataType', function() {
  it('should not break on empty input', function() {
    expect(fromJS({})).toEqual(getDataType(fromJS({})));
  });

  it('should return null with KBC.datatype.length only (no base type)', function() {
    expect(
      fromJS({})
    ).toEqual(getDataType(fromJS(
      [
        {
          id: '85349672',
          key: DataTypeKeys.LENGTH,
          value: '19,4',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    )));
  });

  it('should return null with KBC.datatype.nullable only (no base type)', function() {
    expect(
      fromJS({})
    ).toEqual(getDataType(fromJS(
      [
        {
          id: '85349670',
          key: DataTypeKeys.NULLABLE,
          value: '1',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    )));
  });

  it('should work with KBC.datatype.basetype only', function() {
    expect(fromJS({
      provider: 'keboola.ex-db-mssql',
      "KBC.datatype.basetype": 'NUMERIC'
    })).toEqual(getDataType(fromJS(
      [
        {
          id: '85349671',
          key: DataTypeKeys.BASE_TYPE,
          value: 'NUMERIC',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    )));
  });

  it('should return null for nonexistent KBC.datatype.basetype', function() {
    expect(
      fromJS({})
    ).toEqual(getDataType(fromJS(
      [
        {
          id: '85349671',
          key: DataTypeKeys.BASE_TYPE,
          value: 'NONEXISTENT_TYPE',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        }
      ]
    )));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable', function() {
    expect(fromJS({
      provider: 'keboola.ex-db-mssql',
      "KBC.datatype.basetype": 'NUMERIC',
      "KBC.datatype.nullable": true
    })).toEqual(getDataType(fromJS(
      [
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
    )));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.nullable (nullable set to 0)', function() {
    expect(fromJS({
      provider: 'keboola.ex-db-mssql',
      "KBC.datatype.basetype": 'NUMERIC',
      "KBC.datatype.nullable": false
    })).toEqual(getDataType(fromJS(
      [
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
    )));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.length', function() {
    expect(fromJS({
      provider: 'keboola.ex-db-mssql',
      "KBC.datatype.basetype": 'NUMERIC',
      "KBC.datatype.length": '19,4'
    })).toEqual(getDataType(fromJS(
      [
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
    )));
  });

  it('should work with KBC.datatype.basetype and KBC.datatype.type', function() {
    expect(fromJS({
      provider: 'keboola.ex-db-mssql',
      "KBC.datatype.type": 'DECIMAL',
      "KBC.datatype.basetype": 'NUMERIC',
      "KBC.datatype.length": '19,4'
    })).toEqual(getDataType(fromJS(
      [
        {
          id: '85349670',
          key: 'KBC.datatype.type',
          value: 'DECIMAL',
          provider: 'keboola.ex-db-mssql',
          timestamp: '2018-11-19T13:04:43+0100'
        },
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
    )));
  });
});

describe('isNullable', function() {
  it('should return true when value is truthy', function() {
    expect(isNullable(1)).toEqual(true);
    expect(isNullable("1")).toEqual(true);
    expect(isNullable(true)).toEqual(true);
    expect(isNullable("true")).toEqual(true);
  });

  it('should return false when value is falsy', function() {
    expect(isNullable("")).toEqual(false);
    expect(isNullable(0)).toEqual(false);
    expect(isNullable("0")).toEqual(false);
    expect(isNullable(false)).toEqual(false);
    expect(isNullable("false")).toEqual(false);
  });
});
