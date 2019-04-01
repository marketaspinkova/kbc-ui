import keyMirror from 'fbjs/lib/keyMirror';

const ActionTypes = keyMirror({
  METADATA_EDIT_START: null,
  METADATA_EDIT_UPDATE: null,
  METADATA_EDIT_CANCEL: null,
  METADATA_EDIT_STOP: null,

  METADATA_SAVE_START: null,
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

export {
  ActionTypes,
  DataTypeKeys,
};
