import Immutable from 'immutable';
import StoreUtils from '../../../utils/StoreUtils';
import Constants from '../Constants';
import Dispatcher from '../../../Dispatcher';

var _store = Immutable.Map({
  credentials: Immutable.Map(),
  touch: null,
  pendingActions: Immutable.Map(),
  isLoading: false,
  isLoaded: false
});

var RStudioSandboxCredentialsStore = StoreUtils.createStore({
  getCredentials: function() {
    return _store.get('credentials');
  },
  getValidUntil: function() {
    return (_store.get('touch') + 3600 * 120) * 1000;
  },
  hasCredentials: function() {
    return !!_store.getIn(['credentials', 'id']);
  },
  getPendingActions: function() {
    return _store.get('pendingActions');
  },
  getIsLoading: function() {
    return _store.get('isLoading');
  },
  getIsLoaded: function() {
    return _store.get('isLoaded');
  }
});

Dispatcher.register(function(payload) {
  var action, credentials;
  action = payload.action;
  switch (action.type) {
    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD:
      _store = _store.set('isLoading', true);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_SUCCESS:
      credentials = Immutable.fromJS(action.credentials);
      _store = _store.set('credentials', credentials);
      _store = _store.set('touch', action.touch);
      _store = _store.set('isLoaded', true);
      _store = _store.set('isLoading', false);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB:
      _store = _store.setIn(['pendingActions', 'create'], true);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB_SUCCESS:
      credentials = Immutable.fromJS(action.credentials);
      _store = _store.set('credentials', credentials);
      _store = _store.set('touch', action.touch);
      _store = _store.deleteIn(['pendingActions', 'create']);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB_ERROR:
      _store = _store.deleteIn(['pendingActions', 'create']);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB:
      _store = _store.setIn(['pendingActions', 'drop'], true);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB_SUCCESS:
      _store = _store.set('credentials', Immutable.Map());
      _store = _store.set('touch', null);
      _store = _store.deleteIn(['pendingActions', 'drop']);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB_ERROR:
      _store = _store.deleteIn(['pendingActions', 'drop']);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND:
      _store = _store.setIn(['pendingActions', 'extend'], true);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND_SUCCESS:
      _store = _store.set('touch', action.touch);
      _store = _store.deleteIn(['pendingActions', 'extend']);
      return RStudioSandboxCredentialsStore.emitChange();

    case Constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND_ERROR:
      _store = _store.deleteIn(['pendingActions', 'extend']);
      return RStudioSandboxCredentialsStore.emitChange();

    default:
      break;
  }
});

export default RStudioSandboxCredentialsStore;
