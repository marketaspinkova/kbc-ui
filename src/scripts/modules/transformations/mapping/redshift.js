import { fromJS } from 'immutable';

export default fromJS({
  SMALLINT: {
    name: 'SMALLINT',
    basetype: 'INTEGER',
    size: false
  },
  INT2: {
    name: 'INT2',
    basetype: 'INTEGER',
    size: false
  },
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
    size: false
  },
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  INT4: {
    name: 'INT4',
    basetype: 'INTEGER',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    basetype: 'INTEGER',
    size: false
  },
  INT8: {
    name: 'INT8',
    basetype: 'INTEGER',
    size: false
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
  REAL: {
    name: 'REAL',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT4: {
    name: 'FLOAT4',
    basetype: 'FLOAT',
    size: false
  },
  'DOUBLE PRECISION': {
    name: 'DOUBLE PRECISION',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT8: {
    name: 'FLOAT8',
    basetype: 'FLOAT',
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
    basetype: 'BOOLEAN',
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
    basetype: 'TIMESTAMP',
    size: false
  },
  'TIMESTAMP WITHOUT TIME ZONE': {
    name: 'TIMESTAMP WITHOUT TIME ZONE',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMPTZ: {
    name: 'TIMESTAMPTZ',
    basetype: 'TIMESTAMP',
    size: false
  }
});