import keyMirror from 'fbjs/lib/keyMirror';

export const jobsLimit = 20;
export const filesLimit = 50;

export const ActionTypes = keyMirror({
  UPDATE_SEARCH_QUERY: null,
  RELOAD: null,
  RELOAD_SUCCESS: null,
  RELOAD_ERROR: null
});

export const bucketSharingTypes = {
  ORGANIZATION: 'organization',
  ORGANIZATION_PROJECT: 'organization-project'
};
