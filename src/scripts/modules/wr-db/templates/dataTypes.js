/* defulat defined in .../wr-db/react/pages/table.coffee
defaultDataTypes =
['INT','BIGINT',
'VARCHAR': {defaultSize: '255'},
'TEXT',
'DECIMAL': {defaultSize: '12,2'},
'DATE', 'DATETIME'
]
*/

const mysql = [
  'INT',
  'BIGINT',
  { VARCHAR: { defaultSize: '255' } },
  'TEXT',
  { DECIMAL: { defaultSize: '12,2' } },
  'DATE',
  'DATETIME'
];

const redshift = [
  'SMALLINT',
  'INTEGER',
  'BIGINT',
  { DECIMAL: { defaultSize: '12,2' } },
  'REAL',
  'DOUBLE PRECISION',
  { CHAR: { defaultSize: '255' } },
  'BOOLEAN',
  { VARCHAR: { defaultSize: '255' } },
  'DATE',
  'TIMESTAMP'
];

const mssql = [
  'bigint',
  { uniqueidentifier: { defaultSize: '36' } },
  'money',
  { decimal: { defaultSize: '12,2' } },
  'real',
  { float: { defaultSize: '12' } },
  'date',
  'datetime',
  'smalldatetime',
  'datetime2',
  { time: { defaultSize: '7' } },
  'timestamp',
  { char: { defaultSize: '255' } },
  'text',
  { varchar: { defaultSize: '255' } },
  'smallint',
  { nchar: { defaultSize: '255' } },
  'int',
  { nvarchar: { defaultSize: '255' } },
  'ntext',
  { binary: { defaultSize: '1' } },
  'image',
  { varbinary: { defaultSize: '1' } }
];
const impala = [
  'bigint',
  'boolean',
  { char: { defaultSize: '255' } },
  'double',
  { decimal: { defaultSize: '9,0' } },
  'float',
  'int',
  'real',
  'smallint',
  'string',
  'timestamp',
  'tinyint',
  { varchar: { defaultSize: '255' } }
];
const oracleold = [
  'char',
  'nchar',
  'varchar2',
  'nvarchar',
  'blob',
  'clob',
  'nclob',
  'bfile',
  'number',
  'binary_float',
  'binary_double',
  'decimal',
  'float',
  'integer',
  'date',
  'timestamp',
  'raw',
  'rowid',
  'urowid'
];
const oracle = [
  'bfile',
  'binary_float',
  'binary_double',
  'blob',
  { char: { defaultSize: '255' } },
  'clob',
  'date',
  { nchar: { defaultSize: '255' } },
  'nclob',
  { nvarchar2: { defaultSize: '255' } },
  { number: { defaultSize: '12,2' } },
  { raw: { defaultSize: '255' } },
  'rowid',
  'timestamp',
  'urowid',
  { varchar2: { defaultSize: '255' } }
];
const snowflake = [
  { number: { defaultSize: '38,0' } },
  { decimal: { defaultSize: '38,0' } },
  { numeric: { defaultSize: '38,0' } },
  'int',
  'integer',
  'bigint',
  'smallint',
  'tinyint',
  'byteint',
  'float',
  'float4',
  'float8',
  'double',
  'double precision',
  'real',
  'boolean',
  { char: { defaultSize: '255' } },
  { character: { defaultSize: '255' } },
  { varchar: { defaultSize: '255' } },
  { string: { defaultSize: '255' } },
  { text: { defaultSize: '16777216' } },
  { binary: { defaultSize: '255' } },
  'date',
  { time: { defaultSize: '9' } },
  'timestamp',
  'timestamp_ltz',
  'timestamp_ntz',
  'timestamp_tz',
  'variant'
];
const pgsql = [
  'int',
  'smallint',
  'integer',
  'bigint',
  { decimal: { defaultSize: '12,2' } },
  { numeric: { defaultSize: '12,0' } },
  'real',
  'double precision',
  'float4',
  'float8',
  'serial',
  'bigserial',
  'smallserial',
  'money',
  'boolean',
  { char: { defaultSize: '255' } },
  { character: { defaultSize: '255' } },
  { varchar: { defaultSize: '255' } },
  { 'character varying': { defaultSize: '255' } },
  'text',
  'bytea',
  'date',
  'time',
  'time with time zone',
  'timestamp',
  'timestamptz',
  'timestamp with time zone',
  'interval',
  { enum: { defaultSize: 'my_enum_type' } },
  'json',
  'jsonb'
];
const thoughtspot = [
  'int',
  'bigint',
  'double',
  'float',
  'bool',
  { varchar: { defaultSize: '255' } },
  'timestamp',
  'date',
  'time',
  'datetime'
];

export default {
  'keboola.wr-db-snowflake': {
    typesList: snowflake,
    default: {
      type: 'string',
      size: '255'
    }
  },
  'keboola.wr-db-oracle': {
    typesList: oracle,
    default: {
      type: 'varchar2',
      size: '255'
    }
  },
  'keboola.wr-db-impala': {
    typesList: impala,
    default: {
      type: 'varchar',
      size: '255'
    }
  },
  'keboola.wr-db-mssql-v2': {
    typesList: mssql,
    default: {
      type: 'nvarchar',
      size: '255'
    }
  },
  'keboola.wr-db-pgsql': {
    typesList: pgsql,
    default: {
      type: 'varchar',
      size: '255'
    }
  },
  'keboola.wr-redshift-v2': {
    typesList: redshift,
    default: {
      type: 'VARCHAR',
      size: '255'
    }
  },
  'wr-db-mssql': {
    typesList: mssql,
    default: {
      type: 'varchar',
      size: '255'
    }
  },
  'wr-db-redshift': {
    typesList: redshift,
    default: {
      type: 'VARCHAR',
      size: '255'
    }
  },
  'wr-db-oracle': {
    typesList: oracleold,
    default: {
      type: 'varchar2'
    }
  },
  'keboola.wr-db-mysql': {
    typesList: mysql,
    default: {
      type: 'TEXT'
    }
  },
  'keboola.wr-thoughtspot': {
    disabledFields: ['nullable', 'default'],
    typesList: thoughtspot,
    default: {
      type: 'varchar',
      size: '255'
    }
  }
};
