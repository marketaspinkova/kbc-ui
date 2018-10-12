
const defaultFields = [
  {
    'label': 'Host Name',
    'name': 'host',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Port',
    'name': 'port',
    'type': 'number',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }, {
    'label': 'Database',
    'name': 'database',
    'type': 'text',
    'protected': false,
    'required': true
  }
];

/*
# impala fields:
# host: impala
# port: 21050
# database: default
# user: impala
# password:
# auth_mech: 0
*/

const firebirdFields = [
  {
    'label': 'Database',
    'name': 'dbname',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }
];

const oracleFields = [
  {
    'label': 'Host Name',
    'name': 'host',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Port',
    'name': 'port',
    'type': 'number',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }, {
    'label': 'Service Name/SID',
    'name': 'database',
    'type': 'text',
    'protected': false,
    'required': true
  }
];

const snowflakeFields = [
  {
    'label': 'Host Name',
    'name': 'host',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Port',
    'name': 'port',
    'type': 'number',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }, {
    'label': 'Database',
    'name': 'database',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Schema',
    'name': 'schema',
    'type': 'text',
    'protected': false,
    'required': false
  }, {
    'label': 'Warehouse',
    'name': 'warehouse',
    'type': 'text',
    'protected': false,
    'required': false
  }
];

// same as default, but database is optional
const mysqlFields = [
  {
    'label': 'Host Name',
    'name': 'host',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Port',
    'name': 'port',
    'type': 'number',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }, {
    'label': 'Database',
    'name': 'database',
    'type': 'text',
    'protected': false,
    'required': false
  }, {
    'label': 'Network Compression',
    'name': 'networkCompression',
    'type': 'checkbox',
    'protected': false,
    'required': false
  }
];

// same as default without port - should be always 1025
const teradataFields = [
  {
    'label': 'Host Name',
    'name': 'host',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Port',
    'name': 'port',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Username',
    'name': 'user',
    'type': 'text',
    'protected': false,
    'required': true
  }, {
    'label': 'Password',
    'name': '#password',
    'type': 'password',
    'protected': true,
    'required': true
  }, {
    'label': 'Database',
    'name': 'database',
    'type': 'text',
    'protected': false,
    'required': false
  }
];

const COMPONENTS_FIELDS = {
  'keboola.ex-db-mysql': mysqlFields,
  'keboola.ex-db-pgsql': defaultFields,
  'keboola.ex-db-redshift': defaultFields,
  'keboola.ex-db-db2': defaultFields,
  'keboola.ex-db-firebird': firebirdFields,
  'keboola.ex-db-impala': defaultFields,
  'keboola.ex-db-oracle': oracleFields,
  'keboola.ex-mongodb': defaultFields,
  'keboola.ex-db-snowflake': snowflakeFields,
  'keboola.ex-teradata': teradataFields
};


export function getFields(componentId) {
  if (COMPONENTS_FIELDS[componentId]) {
    return COMPONENTS_FIELDS[componentId];
  } else {
    return defaultFields;
  }
}

// returns @array of properties that needs to be hashed
// should return only password property in most cases
export function getProtectedProperties(componentId) {
  let result = [];
  getFields(componentId).forEach(function(f) {
    if (f.protected) {
      result.push(f.name);
    }
  });
  return result;
}
