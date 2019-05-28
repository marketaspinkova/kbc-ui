import Dispatcher from '../../Dispatcher';
import constants from './constants';

import {Map, List, fromJS} from 'immutable';
import StoreUtils, { initStore } from '../../utils/StoreUtils';

const ActionTypes = constants.ActionTypes;

let _store = initStore('StorageTokensStore', Map({
  tokens: List(),
  isLoaded: false,
  isLoading: false,
  deletingTokens: Map(),
  refreshingTokens: Map(),
  sendingTokens: Map(),
  localState: Map()
}));

const StorageTokensStore = StoreUtils.createStore({
  getAll: () => _store.get('tokens'),
  getIsLoading: () => _store.get('isLoading'),
  getIsLoaded: () =>  _store.get('isLoaded'),
  isDeletingToken: (tokenId) => _store.getIn(['deletingTokens', tokenId], false),
  isRefreshingToken: (tokenId) => _store.getIn(['refreshingTokens', tokenId], false),
  isSendingToken: (tokenId) => _store.getIn(['sendingTokens', tokenId], false),
  localState: () => _store.get('localState')
});


Dispatcher.register( (payload) => {
  let newTokens = null;
  let tokens = null;
  let token = null;
  const action = payload.action;
  switch (action.type) {
    case ActionTypes.STORAGE_TOKEN_CREATE_SUCCESS:
      token = action.token;
      tokens = _store.get('tokens', List());
      _store = _store.set('tokens', tokens.push(token));
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_UPDATE_SUCCESS:
      token = action.token;
      const tokenId = action.tokenId;
      tokens = _store.get('tokens', List()).map(t => t.get('id') === tokenId ? token : t);
      _store = _store.set('tokens', tokens);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKENS_LOAD:
      _store = _store.set('isLoading', true);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKENS_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        return store.set('tokens', fromJS(action.tokens)).set('isLoading', false).set('isLoaded', true);
      });
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_DELETE:
      _store = _store.setIn(['deletingTokens', action.tokenId], true);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_DELETE_SUCCESS:
      _store = _store.setIn(['deletingTokens', action.tokenId], false);
      newTokens = _store.get('tokens').filter(function(t) {
        return t.get('id') !== action.tokenId;
      });
      _store = _store.set('tokens', newTokens);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_DELETE_ERROR:
      _store = _store.setIn(['deletingTokens', action.tokenId], false);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKENS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_REFRESH:
      _store = _store.setIn(['refreshingTokens', action.tokenId], true);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_REFRESH_SUCCESS:
      _store = _store.setIn(['refreshingTokens', action.tokenId], false);
      newTokens = _store.get('tokens').map(function(t) {
        return t.get('id') === action.tokenId ? action.newToken : t;
      });
      _store = _store.set('tokens', newTokens);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_REFRESH_ERROR:
      _store = _store.setIn(['refreshingTokens', action.tokenId], false);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_UPDATE_LOCALSTATE:
      _store = _store.set('localState', action.localState);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_SEND:
      _store = _store.setIn(['sendingTokens', action.tokenId], true);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_SEND_SUCCESS:
      _store = _store.setIn(['sendingTokens', action.tokenId], false);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_SEND_ERROR:
      _store = _store.setIn(['sendingTokens', action.tokenId], false);
      StorageTokensStore.emitChange();
      break;
    case ActionTypes.STORAGE_TOKEN_API_ERROR:
      _store = _store.set('error', action.error);
      StorageTokensStore.emitChange();
      break;
    default:
      break;
  }
});


export default StorageTokensStore;
