import React from 'react';
import { fromJS } from 'immutable';
import InputMappingRowSnowflakeEditor from './InputMappingRowSnowflakeEditor';

describe('<InputMappingRowSnowflakeEditor />', function() {
  it('should render ok', function() {
    shallowSnapshot(<InputMappingRowSnowflakeEditor
      value={fromJS({})}
      tables={fromJS([])}
      onChange={() => {}}
      disabled={false}
      initialShowDetails={false}
      isDestinationDuplicate={false}
    />);
  });

  it('should render ok with source and destination', function() {
    shallowSnapshot(<InputMappingRowSnowflakeEditor
      value={fromJS({
        source: 'in.c-keboola-ex-db-mssql-464960895.products',
        destination: 'products'
      })}
      tables={fromJS({})}
      onChange={() => {}}
      disabled={false}
      initialShowDetails={false}
      isDestinationDuplicate={false}
    />);
  });

  it('should render ok with source, dest, and default filter set', function() {
    shallowSnapshot(<InputMappingRowSnowflakeEditor
      value={fromJS({
        source: 'in.c-keboola-ex-db-mssql-464960895.products',
        destination: 'products',
        whereColumn: '',
        whereValues: [],
        whereOperator: 'eq'
      })}
      tables={fromJS({})}
      onChange={() => {}}
      disabled={false}
      initialShowDetails={false}
      isDestinationDuplicate={false}
    />);
  });

  it('should render ok with source, dest, default filter set and tables (no datatypes)', function() {
    shallowSnapshot(<InputMappingRowSnowflakeEditor
      value={fromJS({
        source: 'in.c-keboola-ex-db-mssql-464960895.products',
        destination: 'products',
        whereColumn: '',
        whereValues: [],
        whereOperator: 'eq'
      })}
      tables={fromJS({
        'in.c-keboola-ex-db-mssql-464960895.products': {
          id: 'in.c-keboola-ex-db-mssql-464960895.products',
          columns: [
            'ProductID',
            'ProductName',
            'Price',
            'ProductDescription'
          ]
        }
      })}
      onChange={() => {}}
      disabled={false}
      initialShowDetails={false}
      isDestinationDuplicate={false}
    />);
  });
});
