import { fromJS } from 'immutable';

export default fromJS({
  BIGINT: {
    name: 'BIGINT',
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
  DOUBLE: {
    name: 'DOUBLE',
    size: false
  },
  DECIMAL: {
    name: 'DECIMAL',
    basetype: 'NUMERIC',
    size: true
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  REAL: {
    name: 'REAL',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    size: false
  },
  STRING: {
    name: 'STRING',
    basetype: 'STRING',
    size: true,
    maxLength: 16777216
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  TINYINT: {
    name: 'TINYINT',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    size: true,
    maxLength: 16777216
  }
});