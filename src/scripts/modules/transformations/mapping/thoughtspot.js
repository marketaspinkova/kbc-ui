import { fromJS } from 'immutable';

export default fromJS({
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  BIGINT: {
    name: 'BIGINT',
    size: false
  },
  DOUBLE: {
    name: 'DOUBLE',
    size: false
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  BOOL: {
    name: 'BOOL',
    basetype: 'BOOL',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'STRING',
    size: true,
    maxLength: 16777216
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
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
  }
});