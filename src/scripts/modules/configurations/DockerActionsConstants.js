import keyMirror from 'fbjs/lib/keyMirror';

const ActionTypes = keyMirror({
  // Components
  DOCKER_RUNNER_SYNC_ACTION_RUN: null,
  DOCKER_RUNNER_SYNC_ACTION_RUN_SUCCESS: null,
  DOCKER_RUNNER_SYNC_ACTION_RUN_ERROR: null
});

export {
  ActionTypes
};
