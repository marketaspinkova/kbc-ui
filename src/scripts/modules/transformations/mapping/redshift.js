import { fromJS } from 'immutable';

export default fromJS({
  SMALLINT: {
    name: 'SMALLINT',
    size: false
  },
  INT2: {
    name: 'INT2',
    size: false
  },
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
    size: false
  },
  INT: {
    name: 'INT',
    size: false
  },
  INT4: {
    name: 'INT4',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    size: false
  },
  INT8: {
    name: 'INT8',
    size: false
  },
  DECIMAL: {
    name: 'DECIMAL',
    size: true
  },
  NUMERIC: {
    name: 'NUMERIC',
    basetype: 'NUMERIC',
    size: true
  },
  REAL: {
    name: 'REAL',
    size: false
  },
  FLOAT4: {
    name: 'FLOAT4',
    size: false
  },
  'DOUBLE PRECISION': {
    name: 'DOUBLE PRECISION',
    size: false
  },
  FLOAT8: {
    name: 'FLOAT8',
    size: false
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  BOOLEAN: {
    name: 'BOOLEAN',
    basetype: 'BOOLEAN',
    size: false
  },
  BOOL: {
    name: 'BOOL',
    size: false
  },
  CHAR: {
    name: 'CHAR',
    size: false
  },
  CHARACTER: {
    name: 'CHARACTER',
    size: false
  },
  NCHAR: {
    name: 'NCHAR',
    size: false
  },
  BPCHAR: {
    name: 'BPCHAR',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  },
  "CHARACTER VARYING": {
    name: 'CHARACTER VARYING',
    size: false
  },
  NVARCHAR: {
    name: 'NVARCHAR',
    size: false
  },
  TEXT: {
    name: 'TEXT',
    size: false
  },
  DATE: {
    name: 'DATE',
    basetype: 'DATE',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  'TIMESTAMP WITH TIME ZONE': {
    name: 'TIMESTAMP WITH TIME ZONE',
    size: false
  },
  'TIMESTAMP WITHOUT TIME ZONE': {
    name: 'TIMESTAMP WITHOUT TIME ZONE',
    size: false
  },
  TIMESTAMPTZ: {
    name: 'TIMESTAMPTZ',
    size: false
  }
});