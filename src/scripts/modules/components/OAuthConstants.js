import keyMirror from 'fbjs/lib/keyMirror';

export default {
  ActionTypes: keyMirror({
    OAUTH_DELETE_CREDENTIALS_SUCCESS: null,
    OAUTH_DELETE_CREDENTIALS_START: null,
    OAUTH_API_ERROR: null,
    OAUTH_LOAD_CREDENTIALS_SUCCESS: null,
    OAUTH_LOAD_CREDENTIALS_ERROR: null
  })
};
