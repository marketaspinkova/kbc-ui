import keyMirror from 'fbjs/lib/keyMirror';

export const jobsLimit = 20;
export const filesLimit = 50;

export const ActionTypes = keyMirror({
  UPDATE_SEARCH_QUERY: null,
  UPDATE_FILES_SEARCH_QUERY: null,
  SET_OPENED_BUCKETS: null,
  SET_OPENED_COLUMNS: null,
  DOCUMENTATION_UPDATE_SEARCH_QUERY: null,
  DOCUMENTATION_TOGGLE_OPENED_ROWS: null,
  DOCUMENTATION_LOAD_SNAPSHOTS_SUCCESS: null,
  DOCUMENTATION_LOAD_SNAPSHOTS_ERROR: null,
  RELOAD: null,
  RELOAD_SUCCESS: null,
  RELOAD_ERROR: null
});

export const bucketSharingTypes = {
  ORGANIZATION: 'organization',
  ORGANIZATION_PROJECT: 'organization-project'
};

export const eventsTemplates = {
  'storage.tableImportStarted': {
    'message': 'Import started',
    'className': ''
  },

  'storage.tableImportDone': {
    'message': 'Successfully imported',
    'className': 'success'
  },

  'storage.tableImportError': {
    'message': 'Error on table import',
    'className': 'error'
  },

  'storage.tableExported': {
    'message': 'Exported to a csv file',
    'className': 'info'
  }
};
