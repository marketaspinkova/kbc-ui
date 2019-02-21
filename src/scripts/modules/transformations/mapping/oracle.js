import { fromJS } from 'immutable';

export default fromJS({
  BFILE: {
    name: 'BFILE',
    size: false
  },
  BINARY_FLOAT: {
    name: 'BINARY_FLOAT',
    size: false
  },
  BINARY_DOUBLE: {
    name: 'BINARY_DOUBLE',
    size: false
  },
  BLOB: {
    name: 'BLOB',
    size: false
  },
  CHAR: {
    name: 'CHAR',
    size: false
  },
  CLOB: {
    name: 'CLOB',
    size: false
  },
  DATE: {
    name: 'DATE',
    basetype: 'DATE',
    size: false
  },
  NCHAR: {
    name: 'NCHAR',
    size: false
  },
  NCLOB: {
    name: 'NCLOB',
    size: false
  },
  NVARCHAR2: {
    name: 'NVARCHAR2',
    size: false
  },
  NUMBER: {
    name: 'NUMBER',
    basetype: 'NUMERIC',
    size: true
  },
  RAW: {
    name: 'RAW',
    size: false
  },
  ROWID: {
    name: 'ROWID',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  UROWID: {
    name: 'UROWID',
    size: false
  },
  VARCHAR2: {
    name: 'VARCHAR2',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  }
});