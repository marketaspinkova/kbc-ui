export default {
  mysql: {
    fieldsMapping: {
      host: 'hostname',
      database: 'db',
      password: 'password',
      user: 'user'
    },
    defaultPort: '3306',
    name: 'MySQL'
  },
  redshift: {
    fieldsMapping: {
      host: 'hostname',
      database: 'db',
      password: 'password',
      user: 'user',
      schema: 'schema'
    },
    defaultPort: '5439',
    name: 'Redshift'
  },
  snowflake: {
    fieldsMapping: {
      host: 'hostname',
      database: 'db',
      password: 'password',
      user: 'user',
      schema: 'schema',
      warehouse: 'warehouse'
    },
    defaultPort: '443',
    name: 'Snowflake'
  }
};
