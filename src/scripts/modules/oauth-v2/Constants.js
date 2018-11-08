import keyMirror from 'fbjs/lib/keyMirror';

export const ActionTypes = keyMirror({
  OAUTHV2_DELETE_CREDENTIALS_SUCCESS: null,
  OAUTHV2_DELETE_CREDENTIALS_START: null,
  OAUTHV2_API_ERROR: null,
  OAUTHV2_LOAD_CREDENTIALS_SUCCESS: null,
  OAUTHV2_LOAD_CREDENTIALS_ERROR: null,
  OAUTHV2_POST_CREDENTIALS_SUCCESS: null,
  OAUTHV2_POST_CREDENTIALS_START: null
});

export const Constants = {
  OAUTH_VERSION_3: 3,
  OAUTH_VERSION_FALLBACK: 2,
  OAUTH_V3_FEATURE: 'oauth-v3'
};
