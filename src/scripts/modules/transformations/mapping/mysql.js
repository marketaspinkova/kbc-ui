import { fromJS } from 'immutable';

export default fromJS({
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
  TINYINT: {
    name: 'TINYINT',
    basetype: 'INTEGER',
    size: false
  },
  SMALLINT: {
    name: 'SMALLINT',
    basetype: 'INTEGER',
    size: false
  },
  MEDIUMINT: {
    name: 'MEDIUMINT',
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
  DEC: {
    name: 'DEC',
    basetype: 'NUMERIC',
    size: true
  },
  FIXED: {
    name: 'FIXED',
    basetype: 'FLOAT',
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
    basetype: 'FLOAT',
    size: false
  },
  REAL: {
    name: 'REAL',
    basetype: 'FLOAT',
    size: false
  },
  DOUBLE: {
    name: 'DOUBLE',
    basetype: 'FLOAT',
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
    basetype: 'TIMESTAMP',
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