const ports = {
  'keboola.ex-db-pgsql': 5432,
  'keboola.ex-db-redshift': 5439,
  'keboola.ex-db-db2': 50000,
  'keboola.ex-db-impala': 21050,
  'keboola.ex-db-mysql': 3306,
  'keboola.ex-db-mysql-custom': 3306,
  'keboola.ex-db-oracle': 1521,
  'keboola.ex-db-mssql': 1433,
  'keboola.ex-mongodb': 27017,
  'keboola.ex-db-snowflake': 443,
  'keboola.ex-teradata': 1025
};

export default function(componentId) {
  return ports[componentId];
}
