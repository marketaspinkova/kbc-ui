import { fromJS } from 'immutable'

export default fromJS({
  NUMBER: {
    name: 'NUMBER',
    basetype: 'NUMERIC',
    size: true
  },
  DECIMAL: {
    name: 'DECIMAL',
    basetype: 'NUMERIC',
    size: true
  },
  NUMERIC: {
    name: 'NUMERIC',
    basetype: 'NUMERIC',
    size: true
  },
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    basetype: 'INTEGER',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    basetype: 'INTEGER',
    size: false
  },
  TINYINT: {
    name: 'TINYINT',
    basetype: 'INTEGER',
    size: false
  },
  BYTEINT: {
    name: 'BYTEINT',
    basetype: 'INTEGER',
    size: false
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT4: {
    name: 'FLOAT4',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT8: {
    name: 'FLOAT8',
    basetype: 'FLOAT',
    size: false
  },
  DOUBLE: {
    name: 'DOUBLE',
    basetype: 'FLOAT',
    size: false
  },
  'DOUBLE PRECISION': {
    name: 'DOUBLE PRECISION',
    basetype: 'FLOAT',
    size: false
  },
  REAL: {
    name: 'REAL',
    basetype: 'FLOAT',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'STRING',
    size: true,
    maxLength: 16777216
  },
  CHAR: {
    name: 'CHAR',
    size: false
  },
  CHARACTER: {
    name: 'CHARACTER',
    size: false
  },
  STRING: {
    name: 'STRING',
    basetype: 'STRING',
    size: true,
    maxLength: 16777216
  },
  TEXT: {
    name: 'TEXT',
    size: false
  },
  BOOLEAN: {
    name: 'BOOLEAN',
    basetype: 'BOOLEAN',
    size: false
  },
  DATE: {
    name: 'DATE',
    basetype: 'DATE',
    size: false
  },
  DATETIME: {
    name: 'DATETIME',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMP_NTZ: {
    name: 'TIMESTAMP_NTZ',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMP_LTZ: {
    name: 'TIMESTAMP_LTZ',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMP_TZ: {
    name: 'TIMESTAMP_TZ',
    basetype: 'TIMESTAMP',
    size: false
  },
  VARIANT: {
    name: 'VARIANT',
    size: false
  },
  BINARY: {
    name: 'BINARY',
    size: false
  },
  VARBINARY: {
    name: 'VARBINARY',
    size: false
  },
});