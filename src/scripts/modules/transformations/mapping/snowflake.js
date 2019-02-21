import { fromJS } from 'immutable'

export default fromJS({
  NUMBER: {
    name: 'NUMBER',
    basetype: 'NUMERIC',
    size: true
  },
  DECIMAL: {
    name: 'DECIMAL',
    size: true
  },
  NUMERIC: {
    name: 'NUMERIC',
    size: true
  },
  INT: {
    name: 'INT',
    size: false
  },
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    size: false
  },
  TINYINT: {
    name: 'TINYINT',
    size: false
  },
  BYTEINT: {
    name: 'BYTEINT',
    size: false
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT4: {
    name: 'FLOAT4',
    size: false
  },
  FLOAT8: {
    name: 'FLOAT8',
    size: false
  },
  DOUBLE: {
    name: 'DOUBLE',
    size: false
  },
  'DOUBLE PRECISION': {
    name: 'DOUBLE PRECISION',
    size: false
  },
  REAL: {
    name: 'REAL',
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
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMP_NTZ: {
    name: 'TIMESTAMP_NTZ',
    size: false
  },
  TIMESTAMP_LTZ: {
    name: 'TIMESTAMP_LTZ',
    size: false
  },
  TIMESTAMP_TZ: {
    name: 'TIMESTAMP_TZ',
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