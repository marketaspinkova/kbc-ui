import keyMirror from 'fbjs/lib/keyMirror';

export default {
  ActionTypes: keyMirror({

    VERSIONS_LOAD_START: null,
    VERSIONS_LOAD_SUCCESS: null,
    VERSIONS_LOAD_ERROR: null,

    VERSIONS_RELOAD_SUCCESS: null,

    VERSIONS_ROLLBACK_START: null,
    VERSIONS_ROLLBACK_SUCCESS: null,
    VERSIONS_ROLLBACK_ERROR: null,

    VERSIONS_COPY_START: null,
    VERSIONS_COPY_SUCCESS: null,
    VERSIONS_COPY_ERROR: null,

    VERSIONS_NEW_NAME_CHANGE: null,

    VERSIONS_FILTER_CHANGE: null,

    VERSIONS_PENDING_START: null,
    VERSIONS_PENDING_STOP: null,

    VERSIONS_CONFIG_LOAD_SUCCESS: null,
    VERSIONS_CONFIG_LOAD_START: null,
    VERSIONS_CONFIG_LOAD_ERROR: null,
    VERSIONS_MULTI_PENDING_START: null,
    VERSIONS_MULTI_PENDING_STOP: null
  })
};
