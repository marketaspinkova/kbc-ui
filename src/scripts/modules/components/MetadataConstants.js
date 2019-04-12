import keyMirror from 'fbjs/lib/keyMirror';

const ActionTypes = keyMirror({
  METADATA_EDIT_UPDATE: null,
  METADATA_EDIT_CANCEL: null,

  METADATA_SAVE: null,
  METADATA_SAVE_SUCCESS: null,
  METADATA_SAVE_ERROR: null,

  METADATA_DELETE_SUCCESS: null,
  METADATA_DELETE_ERROR: null,
});

const DataTypeKeys = {
  BASE_TYPE: 'KBC.datatype.basetype',
  TYPE: 'KBC.datatype.type',
  LENGTH: 'KBC.datatype.length',
  NULLABLE: 'KBC.datatype.nullable',
};

const BaseTypes = ['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'NUMERIC'];

export {
  ActionTypes,
  DataTypeKeys,
  BaseTypes
};
