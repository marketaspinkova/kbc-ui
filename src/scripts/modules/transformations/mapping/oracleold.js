import { fromJS } from 'immutable';

export default fromJS({
  CHAR: {
    name: 'CHAR',
    size: false
  },
  NCHAR: {
    name: 'NCHAR',
    size: false
  },
  VARCHAR2: {
    name: 'VARCHAR2',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  },
  NVARCHAR: {
    name: 'NVARCHAR',
    size: false
  },
  BLOB: {
    name: 'BLOB',
    size: false
  },
  CLOB: {
    name: 'CLOB',
    size: false
  },
  NCLOB: {
    name: 'NCLOB',
    size: false
  },
  BFILE: {
    name: 'BFILE',
    size: false
  },
  NUMBER: {
    name: 'NUMBER',
    size: true
  },
  BINARY_FLOAT: {
    name: 'BINARY_FLOAT',
    size: false
  },
  BINARY_DOUBLE: {
    name: 'BINARY_DOUBLE',
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
  INTEGER: {
    name: 'INTEGER',
    basetype: 'INTEGER',
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
  RAW: {
    name: 'RAW',
    size: false
  },
  ROWID: {
    name: 'ROWID',
    size: false
  },
  UROWID: {
    name: 'UROWID',
    size: false
  }
});