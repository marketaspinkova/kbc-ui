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
      'datetime', 'datetime2', 'smalldatetime', 'timestamp',
      'integer', 'int', 'smallint', 'bigint',
      'numeric', 'decimal', 'real', 'float'
    ]
  ),
  'keboola.ex-db-pgsql': Immutable.List(
    [
      'timestamp', 'timestamp without time zone', 'timestamp with time zone',
      'smallint', 'integer', 'int', 'bigint', 'double precision', 'serial', 'bigserial',
      'numeric', 'decimal', 'real', 'float'
    ]
  )
});
