import { fromJS, Map } from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import Constants from '../Constants';
import Dispatcher from '../../../Dispatcher';

let _store = initStore('RedshiftSandboxCredentialsStore', Map({
  credentials: Map(),
  pendingActions: Map(),
  isLoading: false,
  isLoaded: false
}));

const RedshiftSandboxCredentialsStore = StoreUtils.createStore({
  getCredentials() {
    return _store.get('credentials');
  },

  hasCredentials() {
    return !!_store.getIn(['credentials', 'id']);
  },

  getPendingActions() {
    return _store.get('pendingActions');
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;
  switch (action.type) {
    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD:
      _store = _store.set('isLoading', true);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_SUCCESS:
      _store = _store.set('credentials', fromJS(action.credentials));
      _store = _store.set('isLoaded', true);
      _store = _store.set('isLoading', false);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE:
      _store = _store.setIn(['pendingActions', 'create'], true);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE_SUCCESS:
      _store = _store.set('credentials', fromJS(action.credentials));
      _store = _store.deleteIn(['pendingActions', 'create']);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE_ERROR:
      _store = _store.deleteIn(['pendingActions', 'create']);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP:
      _store = _store.setIn(['pendingActions', 'drop'], true);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP_SUCCESS:
      _store = _store.set('credentials', Map());
      _store = _store.deleteIn(['pendingActions', 'drop']);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP_ERROR:
      _store = _store.deleteIn(['pendingActions', 'drop']);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH:
      _store = _store.setIn(['pendingActions', 'refresh'], true);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH_SUCCESS:
      _store = _store.set('credentials', fromJS(action.credentials));
      _store = _store.deleteIn(['pendingActions', 'refresh']);
      return RedshiftSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH_ERROR:
      _store = _store.deleteIn(['pendingActions', 'refresh']);
      return RedshiftSandboxCredentialsStore.emitChange();

    default:
  }
});

export default RedshiftSandboxCredentialsStore;
