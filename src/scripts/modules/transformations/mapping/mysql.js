import { fromJS } from 'immutable';

export default fromJS({
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
    size: false
  },
  INT: {
    name: 'INT',
    size: false
  },
  TINYINT: {
    name: 'TINYINT',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    size: false
  },
  MEDIUMINT: {
    name: 'MEDIUMINT',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    size: false
  },
  DECIMAL: {
    name: 'DECIMAL',
    size: true
  },
  DEC: {
    name: 'DEC',
    size: true
  },
  FIXED: {
    name: 'FIXED',
    size: false
  },
  NUMERIC: {
    name: 'NUMERIC',
    basetype: 'NUMERIC',
    size: true
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
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
  DOUBLE: {
    name: 'DOUBLE',
    size: false
  },
  BIT: {
    name: 'BIT',
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
  DATETIME: {
    name: 'DATETIME',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  YEAR: {
    name: 'YEAR',
    size: false
  },
  CHAR: {
    name: 'CHAR',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  },
  BLOB: {
    name: 'BLOB',
    size: false
  },
  TEXT: {
    name: 'TEXT',
    size: false
  }
});