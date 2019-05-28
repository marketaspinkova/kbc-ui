import StoreUtils, { initStore } from '../../utils/StoreUtils';
import { Map } from 'immutable';
import dispatcher from '../../Dispatcher';
import * as Constants from './Constants';

let _store = initStore('OauthV2Store', Map({
  deletingCredentials: Map(),
  credentials: Map()
}));

const OAuthStore = StoreUtils.createStore({
  hasCredentials(componentId, id) {
    return _store.hasIn(['credentials', componentId, id]);
  },

  getCredentials(componentId, id) {
    return _store.getIn(['credentials', componentId, id]);
  },

  isDeletingCredetials(componentId, id) {
    return _store.hasIn(['deletingCredentials', componentId, id]);
  },

  isSavingCredetials(componentId, id) {
    return _store.hasIn(['postingCredentials', componentId, id]);
  }
});

dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.OAUTHV2_LOAD_CREDENTIALS_SUCCESS:
      _store = _store.setIn(['credentials', action.componentId, action.id], action.credentials);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTHV2_DELETE_CREDENTIALS_START:
      _store = _store.setIn(['deletingCredentials', action.componentId, action.id], true);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTHV2_DELETE_CREDENTIALS_SUCCESS:
      _store = _store.deleteIn(['deletingCredentials', action.componentId, action.id]);
      _store = _store.deleteIn(['credentials', action.componentId, action.id]);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTHV2_POST_CREDENTIALS_START:
      _store = _store.setIn(['postingCredentials', action.componentId, action.id], true);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTHV2_POST_CREDENTIALS_SUCCESS:
      _store = _store.deleteIn(['postingCredentials', action.componentId, action.id]);
      _store = _store.setIn(['credentials', action.componentId, action.id], action.credentials);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTHV2_API_ERROR:
      _store = _store.deleteIn(['deletingCredentials', action.componentId, action.id]);
      return OAuthStore.emitChange();

    default:
  }
});

export default OAuthStore;
