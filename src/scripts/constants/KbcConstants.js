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

  // Sapi Token
  SAPI_TOKEN_RECEIVED: null,

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

const FEATURE_UI_DEVEL_PREVIEW = 'ui-devel-preview';
const FEATURE_EARLY_ADOPTER_PREVIEW = 'early-adopter-preview';
const FEATURE_UI_LOOKER_PREVIEW = 'ui-looker-preview';

const lookerPreviewHideComponents = [
  'cleveranalytics.wr-clever-analytics',
  'gooddata-writer',
  'htns.wr-salesforce-analytics-cloud',
  'keboola.ex-gooddata',
  'keboola.gooddata-writer',
  'keboola.wr-thoughtspot',
  'stories.wr-stories',
  'tde-exporter',
  'wr-tableau',
  'wr-tableau-server'
];

export {
  PayloadSources,
  ActionTypes,
  FEATURE_UI_DEVEL_PREVIEW,
  FEATURE_EARLY_ADOPTER_PREVIEW,
  FEATURE_UI_LOOKER_PREVIEW,
  lookerPreviewHideComponents
};
