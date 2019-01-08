import Immutable from 'immutable';

export const incrementalFetchingTypes = Immutable.Map({
  'keboola.ex-db-mysql': Immutable.List(
    [
      'timestamp', 'datetime',
      'integer', 'int', 'smallint', 'mediumint', 'bigint',
      'decimal', 'numeric', 'float', 'double'
    ]
  ),
  'keboola.ex-db-mssql': Immutable.List(
    [
      'datetime', 'datetime2', 'smalldatetime',
      'integer', 'int', 'smallint', 'bigint',
      'numeric', 'decimal', 'real', 'float'
    ]
  )
});
