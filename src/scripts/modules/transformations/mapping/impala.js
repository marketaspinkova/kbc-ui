import { fromJS } from 'immutable';

export default fromJS({
  BIGINT: {
    name: 'BIGINT',
    basetype: 'INTEGER',
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
    basetype: 'FLOAT',
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
    basetype: 'FLOAT',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    basetype: 'INTEGER',
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
    basetype: 'INTEGER',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  }
});