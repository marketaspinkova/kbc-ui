import keyMirror from 'fbjs/lib/keyMirror';

const PayloadSources = keyMirror({
  SERVER_ACTION: null,
  VIEW_ACTION: null
});

const ActionTypes = keyMirror({

  // Application state
  APPLICATION_DATA_RECEIVED: null,
  APPLICATION_SEND_NOTIFICATION: null,
  APPLICATION_DELETE_NOTIFICATION: null,
  APPLICATION_SET_PAUSE_NOTIFICATION: null,

  // Project
  PROJECT_CHANGE_DESCRIPTION_SUCCESS: null,
  PROJECT_CHANGE_DESCRIPTION_ERROR: null,

  // Router state
  ROUTER_ROUTE_CHANGE_START: null,
  ROUTER_ROUTE_CHANGE_SUCCESS: null,
  ROUTER_ROUTE_CHANGE_ERROR: null,
  ROUTER_ROUTES_CONFIGURATION_RECEIVE: null,
  ROUTER_ROUTER_CREATED: null
});

export {
  PayloadSources,
  ActionTypes
};
