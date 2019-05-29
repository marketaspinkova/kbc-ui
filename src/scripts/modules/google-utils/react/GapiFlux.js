import {fromJS, Map} from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import keyMirror from 'fbjs/lib/keyMirror';
import Dispatcher from '../../../Dispatcher';
import {loadMetadata} from '../AnalyticsMetadata';
import Promise from 'bluebird';

const ActionTypes = keyMirror({
  GAPI_START_INIT: null,
  GAPI_FINISH_INIT: null,
  GAPI_START_PICK: null,
  GAPI_FINISH_PICK: null,
  GAPI_ERROR: null,
  GAPI_METADATA_LOAD_START: null,
  GAPI_METADATA_LOAD_SUCCESS: null
});

let _store = initStore('GoogleUtilsStore', Map({
  isInitializing: false,
  isInitialized: false,
  isPicking: Map(), // what true/false
  metadata: Map(),
  isLoadingMetadata: false,
  isLoadedMetadata: false
}));


export const GapiStore = StoreUtils.createStore({
  isInitializing: () => _store.get('isInitializing'),
  isInitialized: () => _store.get('isInitialized'),
  isPicking: (what) => _store.getIn(['isPicking', what], false),
  isLoadingMetadata: () => _store.get('isLoadingMetadata', false),
  isLoadedMetadata: () => _store.get('isLoadedMetadata', false),
  getMetadata: () => _store.get('metadata', Map())
});


Dispatcher.register( (payload) => {
  const action = payload.action;
  switch (action.type) {
    case ActionTypes.GAPI_START_INIT:
      _store = _store.set('isInitializing', true);
      _store = _store.set('isInitialized', false);
      GapiStore.emitChange();
      break;
    case ActionTypes.GAPI_FINISH_INIT:
      _store = _store.set('isInitializing', false);
      _store = _store.set('isInitialized', true);
      GapiStore.emitChange();
      break;
    case ActionTypes.GAPI_METADATA_LOAD_START:
      _store = _store.set('isLoadingMetadata', true);
      _store = _store.set('isLoadedMetadata', false);
      GapiStore.emitChange();
      break;
    case ActionTypes.GAPI_METADATA_LOAD_SUCCESS:
      _store = _store.set('isLoadingMetadata', false);
      _store = _store.set('isLoadedMetadata', true);
      const metadata = action.data;
      _store = _store.set('metadata', fromJS(metadata));
      GapiStore.emitChange();
      break;

    case ActionTypes.GAPI_START_PICK:
      _store = _store.setIn(['isPicking', action.what], true);
      GapiStore.emitChange();
      break;

    case ActionTypes.GAPI_FINISH_PICK:
      _store = _store.setIn(['isPicking', action.what], false);
      GapiStore.emitChange();
      break;
    default:
      return;
  }
});

export const GapiActions = {
  loadAnalyticsMetadata: () => {
    if (GapiStore.isLoadedMetadata()) {
      return Promise.resolve();
    }
    Dispatcher.handleViewAction({
      type: ActionTypes.GAPI_METADATA_LOAD_START
    });
    return loadMetadata().then((data) => {
      Dispatcher.handleViewAction({
        type: ActionTypes.GAPI_METADATA_LOAD_SUCCESS,
        data: data
      });
    }, (err) => {
      Dispatcher.handleViewAction({
        type: ActionTypes.GAPI_ERROR,
        err: err
      });
    });
  },
  startInit: () => {
    Dispatcher.handleViewAction({
      type: ActionTypes.GAPI_START_INIT
    });
  },

  finishInit: () => {
    Dispatcher.handleViewAction({
      type: ActionTypes.GAPI_FINISH_INIT
    });
  },

  startPick: (what) => {
    Dispatcher.handleViewAction({
      type: ActionTypes.GAPI_START_PICK,
      what: what
    });
  },

  finishPick: (what) => {
    Dispatcher.handleViewAction({
      type: ActionTypes.GAPI_FINISH_PICK,
      what: what
    });
  }
};
