import keyMirror from 'fbjs/lib/keyMirror';

export const ProvisioningActionTypes = keyMirror({
  GD_PROVISIONING_LOAD_START: null,
  GD_PROVISIONING_LOAD_SUCCESS: null,
  GD_PROVISIONING_LOAD_ERROR: null,
  GD_PROVISIONING_CREATE_START: null,
  GD_PROVISIONING_CREATE_SUCCESS: null,
  GD_PROVISIONING_CREATE_ERROR: null,
  GD_PROVISIONING_TOGGLESSO_START: null,
  GD_PROVISIONING_TOGGLESSO_SUCCESS: null,
  GD_PROVISIONING_TOGGLESSO_ERROR: null,
  GD_PROVISIONING_DELETE_START: null,
  GD_PROVISIONING_DELETE_SUCCESS: null,
  GD_PROVISIONING_DELETE_ERROR: null
});


export const DataTypes = keyMirror({
  BIGINT: null,
  DATE: null,
  DECIMAL: null,
  INT: null,
  VARCHAR: null
});


export const Types = keyMirror({
  ATTRIBUTE: null,
  CONNECTION_POINT: null,
  DATE: null,
  FACT: null,
  HYPERLINK: null,
  LABEL: null,
  REFERENCE: null,
  IGNORE: null
});
