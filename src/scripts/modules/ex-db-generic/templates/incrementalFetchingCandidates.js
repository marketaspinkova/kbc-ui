import Immutable from 'immutable';

export const incrementalFetchingTimestampTypes = Immutable.Map({
  'keboola.ex-db-mysql': Immutable.List(['timestamp', 'datetime']),
  'keboola.ex-db-mssql': Immutable.List(['datetime', 'datetime2'])
});

export const incrementalFetchingAutoIncrementProperty = Immutable.Map({
  'keboola.ex-db-mysql': 'autoIncrement',
  'keboola.ex-db-mssql': 'autoIncrement'
});
