import { fromJS } from 'immutable';

export default fromJS({
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
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
  'DOUBLE PRECISION': {
    name: 'DOUBLE PRECISION',
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
  SERIAL: {
    name: 'SERIAL',
    size: false
  },
  BIGSERIAL: {
    name: 'BIGSERIAL',
    size: false
  },
  SMALLSERIAL: {
    name: 'SMALLSERIAL',
    size: false
  },
  MONEY: {
    name: 'MONEY',
    size: false
  },
  BOOLEAN: {
    name: 'BOOLEAN',
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
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  },
  'CHARACTER VARYING': {
    name: 'CHARACTER VARYING',
    size: false
  },
  TEXT: {
    name: 'TEXT',
    size: false
  },
  BYTEA: {
    name: 'BYTEA',
    size: false
  },
  DATE: {
    name: 'DATE',
    basetype: 'DATE',
    size: false
  },
  TIME: {
    name: 'TIME',
    size: false
  },
  'TIME WITH TIME ZONE': {
    name: 'TIME WITH TIME ZONE',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  TIMESTAMPTZ: {
    name: 'TIMESTAMPTZ',
    size: false
  },
  'TIMESTAMP WITH TIME ZONE': {
    name: 'TIMESTAMP WITH TIME ZONE',
    size: false
  },
  INTERVAL: {
    name: 'INTERVAL',
    size: false
  },
  ENUM: {
    name: 'ENUM',
    size: false
  },
  JSON: {
    name: 'JSON',
    size: false
  },
  JSONB: {
    name: 'JSONB',
    size: false
  },
  'INTEGER[]': {
    name: 'INTEGER[]',
    size: false
  }
});