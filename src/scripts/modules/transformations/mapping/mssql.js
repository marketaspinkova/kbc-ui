import { fromJS } from 'immutable';

export default fromJS({
  BIGINT: {
    name: 'BIGINT',
    basetype: 'INTEGER',
    size: false
  },
  UNIQUEIDENTIFIER: {
    name: 'UNIQUEIDENTIFIER',
    size: false
  },
  MONEY: {
    name: 'MONEY',
    size: false
  },
  DECIMAL: {
    name: 'DECIMAL',
    basetype: 'NUMERIC',
    size: true
  },
  REAL: {
    name: 'REAL',
    basetype: 'FLOAT',
    size: false
  },
  FLOAT: {
    name: 'FLOAT',
    basetype: 'FLOAT',
    size: false
  },
  DATE: {
    name: 'DATE',
    basetype: 'DATE',
    size: true
  },
  DATETIME: {
    name: 'DATETIME',
    basetype: 'TIMESTAMP',
    size: true
  },
  SMALLDATETIME: {
    name: 'SMALLDATETIME',
    size: false
  },
  DATETIME2: {
    name: 'DATETIME2',
    size: true
  },
  TIME: {
    name: 'TIME',
    size: false
  },
  TIMESTAMP: {
    name: 'TIMESTAMP',
    basetype: 'TIMESTAMP',
    size: false
  },
  CHAR: {
    name: 'CHAR',
    size: false
  },
  TEXT: {
    name: 'TEXT',
    size: false
  },
  VARCHAR: {
    name: 'VARCHAR',
    basetype: 'VARCHAR',
    size: true,
    maxLength: 16777216
  },
  SMALLINT: {
    name: 'SMALLINT',
    basetype: 'INTEGER',
    size: false
  },
  NCHAR: {
    name: 'NCHAR',
    size: false
  },
  INT: {
    name: 'INT',
    basetype: 'INTEGER',
    size: false
  },
  NVARCHAR: {
    name: 'NVARCHAR',
    size: false
  },
  NTEXT: {
    name: 'NTEXT',
    size: false
  },
  BINARY: {
    name: 'BINARY',
    size: false
  },
  IMAGE: {
    name: 'IMAGE',
    size: false
  },
  VARBINARY: {
    name: 'VARBINARY',
    size: false
  }
});