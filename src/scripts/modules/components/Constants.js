import keyMirror from 'fbjs/lib/keyMirror';

const ActionTypes = keyMirror({
  // Components
  COMPONENTS_SET_FILTER: null,
  COMPONENTS_LOAD_SUCCESS: null,

  // Installed components
  INSTALLED_COMPONENTS_LOAD: null,
  INSTALLED_COMPONENTS_LOAD_SUCCESS: null,
  INSTALLED_COMPONENTS_LOAD_ERROR: null,

  // Deleted components
  DELETED_COMPONENTS_FILTER_CHANGE: null,
  DELETED_COMPONENTS_LOAD: null,
  DELETED_COMPONENTS_LOAD_SUCCESS: null,
  DELETED_COMPONENTS_LOAD_ERROR: null,

  // Deleted components data
  DELETED_COMPONENTS_RESTORE_CONFIGURATION_START: null,
  DELETED_COMPONENTS_RESTORE_CONFIGURATION_SUCCESS: null,
  DELETED_COMPONENTS_RESTORE_CONFIGURATION_ERROR: null,

  DELETED_COMPONENTS_DELETE_CONFIGURATION_START: null,
  DELETED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS: null,
  DELETED_COMPONENTS_DELETE_CONFIGURATION_ERROR: null,

  // Installed components data
  INSTALLED_COMPONENTS_CONFIGDATA_LOAD: null,
  INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS: null,
  INSTALLED_COMPONENTS_CONFIGDATA_LOAD_ERROR: null,
  INSTALLED_COMPONENTS_CONFIGSDATA_LOAD: null,
  INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS: null,
  INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_ERROR: null,
  INSTALLED_COMPONENTS_CONFIGDATA_SAVE_START: null,
  INSTALLED_COMPONENTS_CONFIGDATA_SAVE_SUCCESS: null,
  INSTALLED_COMPONENTS_CONFIGDATA_SAVE_ERROR: null,
  INSTALLED_COMPONENTS_CONFIGDATA_EDIT_UPDATE: null,
  INSTALLED_COMPONENTS_CONFIGDATA_EDIT_CANCEL: null,

  INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_START: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_SUCCESS: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_ERROR: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_UPDATE: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_CANCEL: null,

  INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_START: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_SUCCESS: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_ERROR: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_UPDATE: null,
  INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_CANCEL: null,

  INSTALLED_COMPONENTS_LOCAL_STATE_UPDATE: null,

  INSTALLED_COMPONENTS_CONFIGURATION_EDIT_START: null,
  INSTALLED_COMPONENTS_CONFIGURATION_EDIT_CANCEL: null,
  INSTALLED_COMPONENTS_CONFIGURATION_EDIT_UPDATE: null,

  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_START: null,
  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_SUCCESS: null,
  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ERROR: null,


  INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_START: null,
  INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_CANCEL: null,
  INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_UPDATE: null,

  INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_START: null,
  INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_SUCCESS: null,
  INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_ERROR: null,

  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_START: null,
  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_SUCCESS: null,
  INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_ERROR: null,

  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_START: null,
  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_SUCCESS: null,
  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_ERROR: null,

  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_START: null,
  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS: null,
  INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ERROR: null,

  INSTALLED_COMPONENTS_CONFIGURATION_TOGGLE_MAPPING: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_START: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CHANGE: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CANCEL: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_START: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_SUCCESS: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_ERROR: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_START: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_SUCCESS: null,
  INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_ERROR: null,

  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_CANCEL: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_TEMPLATE: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_PARAMS: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_STRING: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_STRING_TOGGLE: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_START: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_SUCCESS: null,
  INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_ERROR: null,
  INSTALLED_COMPONENTS_SEARCH_CONFIGURATION_FILTER_CHANGE: null,
  INSTALLED_COMPONENTS_SEARCH_COMPONENT_DETAIL_FILTER_CHANGE: null,

  // New configurations
  COMPONENTS_NEW_CONFIGURATION_UPDATE: null,
  COMPONENTS_NEW_CONFIGURATION_CANCEL: null,
  COMPONENTS_NEW_CONFIGURATION_SAVE_START: null,
  COMPONENTS_NEW_CONFIGURATION_SAVE_SUCCESS: null,
  COMPONENTS_NEW_CONFIGURATION_SAVE_ERROR: null,

  // Storage
  STORAGE_BUCKETS_LOAD: null,
  STORAGE_BUCKETS_LOAD_SUCCESS: null,
  STORAGE_BUCKETS_LOAD_ERROR: null,

  STORAGE_BUCKET_CREDENTIALS_DELETE_SUCCESS: null,
  STORAGE_BUCKET_CREDENTIALS_DELETE: null,
  STORAGE_BUCKET_CREDENTIALS_CREATE_SUCCESS: null,
  STORAGE_BUCKET_CREDENTIALS_CREATE: null,
  STORAGE_BUCKET_CREDENTIALS_LOAD_SUCCESS: null,
  STORAGE_BUCKET_CREDENTIALS_LOAD: null,

  STORAGE_TABLES_LOAD: null,
  STORAGE_TABLES_LOAD_SUCCESS: null,
  STORAGE_TABLES_LOAD_ERROR: null,

  STORAGE_FILES_LOAD: null,
  STORAGE_FILES_LOAD_SUCCESS: null,
  STORAGE_FILES_LOAD_ERROR: null,

  STORAGE_FILES_LOAD_MORE: null,
  STORAGE_FILES_LOAD_MORE_SUCCESS: null,
  STORAGE_FILES_LOAD_MORE_ERROR: null,

  STORAGE_FILE_DELETE: null,
  STORAGE_FILE_DELETE_SUCCESS: null,
  STORAGE_FILE_DELETE_ERROR: null,

  STORAGE_BUCKET_CREATE: null,
  STORAGE_BUCKET_CREATE_SUCCESS: null,
  STORAGE_BUCKET_CREATE_ERROR: null,

  STORAGE_BUCKET_DELETE: null,
  STORAGE_BUCKET_DELETE_SUCCESS: null,
  STORAGE_BUCKET_DELETE_ERROR: null,

  STORAGE_BUCKET_SHARE: null,
  STORAGE_BUCKET_SHARE_SUCCESS: null,
  STORAGE_BUCKET_SHARE_ERROR: null,

  STORAGE_BUCKET_UNSHARE: null,
  STORAGE_BUCKET_UNSHARE_SUCCESS: null,
  STORAGE_BUCKET_UNSHARE_ERROR: null,

  STORAGE_SHARED_BUCKETS_LOAD: null,
  STORAGE_SHARED_BUCKETS_LOAD_SUCCESS: null,
  STORAGE_SHARED_BUCKETS_LOAD_ERROR: null,

  STORAGE_TABLE_CREATE: null,
  STORAGE_TABLE_CREATE_SUCCESS: null,
  STORAGE_TABLE_CREATE_ERROR: null,

  STORAGE_ADD_TABLE_COLUMN: null,
  STORAGE_ADD_TABLE_COLUMN_SUCCESS: null,
  STORAGE_ADD_TABLE_COLUMN_ERROR: null,

  STORAGE_DELETE_TABLE_COLUMN: null,
  STORAGE_DELETE_TABLE_COLUMN_SUCCESS: null,
  STORAGE_DELETE_TABLE_COLUMN_ERROR: null,

  STORAGE_ALIAS_TABLE_CREATE: null,
  STORAGE_ALIAS_TABLE_CREATE_SUCCESS: null,
  STORAGE_ALIAS_TABLE_CREATE_ERROR: null,

  STORAGE_SET_ALIAS_TABLE_FILTER: null,
  STORAGE_SET_ALIAS_TABLE_FILTER_SUCCESS: null,
  STORAGE_SET_ALIAS_TABLE_FILTER_ERROR: null,

  STORAGE_REMOVE_ALIAS_TABLE_FILTER: null,
  STORAGE_REMOVE_ALIAS_TABLE_FILTER_SUCCESS: null,
  STORAGE_REMOVE_ALIAS_TABLE_FILTER_ERROR: null,

  STORAGE_TABLE_LOAD: null,
  STORAGE_TABLE_LOAD_SUCCESS: null,
  STORAGE_TABLE_LOAD_ERROR: null,

  STORAGE_TABLE_SET_PRIMARY_KEY: null,
  STORAGE_TABLE_SET_PRIMARY_KEY_SUCCESS: null,
  STORAGE_TABLE_SET_PRIMARY_KEY_ERROR: null,

  STORAGE_TABLE_DELETE_PRIMARY_KEY: null,
  STORAGE_TABLE_DELETE_PRIMARY_KEY_SUCCESS: null,
  STORAGE_TABLE_DELETE_PRIMARY_KEY_ERROR: null,

  STORAGE_TABLE_CREATE_SNOPSHOT: null,
  STORAGE_TABLE_CREATE_SNOPSHOT_SUCCESS: null,
  STORAGE_TABLE_CREATE_SNOPSHOT_ERROR: null,

  STORAGE_RESTORE_TIME_TRAVEL: null,
  STORAGE_RESTORE_TIME_TRAVEL_SUCCESS: null,
  STORAGE_RESTORE_TIME_TRAVEL_ERROR: null,

  STORAGE_TABLE_CREATE_FROM_SNOPSHOT: null,
  STORAGE_TABLE_CREATE_FROM_SNOPSHOT_SUCCESS: null,
  STORAGE_TABLE_CREATE_FROM_SNOPSHOT_ERROR: null,

  STORAGE_TABLE_REMOVE_SNOPSHOT: null,
  STORAGE_TABLE_REMOVE_SNOPSHOT_SUCCESS: null,
  STORAGE_TABLE_REMOVE_SNOPSHOT_ERROR: null,

  STORAGE_TRUNCATE_TABLE: null,
  STORAGE_TRUNCATE_TABLE_SUCCESS: null,
  STORAGE_TRUNCATE_TABLE_ERROR: null,

  STORAGE_DELETE_TABLE: null,
  STORAGE_DELETE_TABLE_SUCCESS: null,
  STORAGE_DELETE_TABLE_ERROR: null,

  STORAGE_TABLE_EXPORT: null,
  STORAGE_TABLE_EXPORT_SUCCESS: null,
  STORAGE_TABLE_EXPORT_ERROR: null,

  STORAGE_LOAD_DATA_INTO_WORKSPACE: null,
  STORAGE_LOAD_DATA_INTO_WORKSPACE_SUCCESS: null,
  STORAGE_LOAD_DATA_INTO_WORKSPACE_ERROR: null,

  STORAGE_FILE_UPLOAD: null,
  STORAGE_FILE_UPLOAD_SUCCESS: null,
  STORAGE_FILE_UPLOAD_ERROR: null,

  STORAGE_JOBS_LOAD: null,
  STORAGE_JOBS_LOAD_SUCCESS: null,
  STORAGE_JOBS_LOAD_ERROR: null,

  STORAGE_JOBS_LOAD_MORE: null,
  STORAGE_JOBS_LOAD_MORE_SUCCESS: null,
  STORAGE_JOBS_LOAD_MORE_ERROR: null
});

const GoodDataWriterModes = keyMirror({
  NEW: null,
  EXISTING: null
});

const GoodDataWriterTokenTypes = {
  PRODUCTION: 'keboola_production',
  DEMO: 'keboola_demo',
  CUSTOM: ''
};

const isCustomAuthToken = function(token) {
  return !['keboola_production', 'keboola_demo'].includes(token);
};

const Routes = {
  GENERIC_DETAIL_PREFIX: 'generic-detail-'
};

export {
  ActionTypes,
  GoodDataWriterModes,
  GoodDataWriterTokenTypes,
  isCustomAuthToken,
  Routes
};
