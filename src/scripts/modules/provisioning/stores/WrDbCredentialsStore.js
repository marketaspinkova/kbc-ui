import Dispatcher from '../../../Dispatcher';
import { Map, fromJS } from 'immutable';
import storeUtils, { initStore } from '../../../utils/StoreUtils';
import constants from '../Constants';

let _store = initStore('WrDbCredentialsStore', Map({
  credentials: Map(),
  loadingCredentials: Map(),
  creatingCredentials: Map(),
  droppingCredentials: Map()
}));

const provisioningStore = storeUtils.createStore({
  getCredentials(type, token) {
    return _store.getIn(['credentials', type, token]);
  },

  isLoadingredentials(type, token) {
    return _store.hasIn(['loadingCredentials', type, token]);
  },

  getIsLoaded(type, token) {
    return _store.hasIn(['credentials', type, token]);
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;
  switch (action.type) {
    case constants.ActionTypes.CREDENTIALS_WRDB_LOAD:
      _store = _store.setIn(['loadingCredentials', action.permission, action.token], true);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_LOAD_SUCCESS:
      _store = _store.deleteIn(['loadingCredentials', action.permission, action.token]);
      _store = _store.setIn(['credentials', action.permission, action.token], fromJS(action.credentials));
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_LOAD_ERROR:
      _store = _store.deleteIn(['loadingCredentials', action.permission, action.token]);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_CREATE:
      _store = _store.setIn(['creatingCredentials', action.permission, action.token], true);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_CREATE_SUCCESS:
      _store = _store.deleteIn(['creatingCredentials', action.permission, action.token]);
      _store = _store.setIn(['credentials', action.permission, action.token], fromJS(action.credentials));
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_CREATE_ERROR:
      _store = _store.deleteIn(['creatingCredentials', action.permission, action.token]);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_DROP:
      _store = _store.setIn(['droppingCredentials', action.permission, action.token], true);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_DROP_SUCCESS:
      _store = _store.deleteIn(['credentials', action.permission, action.token]);
      _store = _store.deleteIn(['droppingCredentials', action.permission, action.token]);
      return provisioningStore.emitChange();

    case constants.ActionTypes.CREDENTIALS_WRDB_DROP_ERROR:
      _store = _store.deleteIn(['droppingCredentials', action.permission, action.token]);
      return provisioningStore.emitChange();

    default:
  }
});

export default provisioningStore;
