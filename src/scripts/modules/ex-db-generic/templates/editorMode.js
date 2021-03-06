// templates by componentId for codemirror editor mode, default is mysql
export default componentId => {
  switch (componentId) {
    case 'keboola.ex-db-pgsql':
      return 'text/x-pgsql';

    case 'keboola.ex-db-redshift':
    case 'keboola.ex-db-redshift-cursors':
      return 'text/x-sql';

    case 'keboola.ex-db-mysql':
      return 'text/x-mysql';

    case 'keboola.ex-db-mssql':
      return 'text/x-mssql';

    case 'keboola.ex-db-oracle':
      return 'text/x-plsql';

    default:
      return 'text/x-mysql';
  }
};
