import keyMirror from 'fbjs/lib/keyMirror';

export default {
  ActionTypes: keyMirror({

    METADATA_EDIT_START: null,
    METADATA_EDIT_UPDATE: null,
    METADATA_EDIT_CANCEL: null,
    METADATA_EDIT_STOP: null,

    METADATA_SAVE_START: null,
    METADATA_SAVE_SUCCESS: null,
    METADATA_SAVE_ERROR: null

  })
};
