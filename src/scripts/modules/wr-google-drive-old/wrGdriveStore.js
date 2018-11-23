import { Map, fromJS } from 'immutable';
import storeUtils from '../../utils/StoreUtils';
import Dispatcher from '../../Dispatcher';
import { ActionTypes } from './constants';

let _store = Map({
  files: Map(),
  loading: Map(),
  googleInfo: Map(),
  editing: Map(),
  updating: Map(),
  deleting: Map(),
  accounts: Map()
});

const WrGdriveStore = storeUtils.createStore({
  getFiles(configId) {
    return _store.getIn(['files', configId]);
  },

  getLoadingGoogleInfo(configId, googleId) {
    return _store.getIn(['loading', 'googleInfo', configId, googleId]);
  },

  getGoogleInfo(configId) {
    return _store.getIn(['googleInfo', configId]);
  },

  getEditingByPath(configId, path) {
    const editPath = ['editing', configId].concat(path);
    return _store.getIn(editPath);
  },

  getEditing(configId) {
    return _store.getIn(['editing', configId], Map());
  },

  getSavingFiles(configId) {
    return _store.getIn(['updating', 'files', configId], Map());
  },

  getDeletingFiles(configId) {
    return _store.getIn(['deleting', configId], Map());
  },

  getAccount(configId) {
    return _store.getIn(['accounts', configId]);
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;
  switch (action.type) {
    case ActionTypes.WR_GDRIVE_LOAD_ACCOUNT_SUCCESS:
      var { configId } = action;
      var data = fromJS(action.account);
      _store = _store.setIn(['accounts', configId], data);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_DELETE_ROW_START:
      ({ configId } = action);
      var { tableId } = action;
      _store = _store.setIn(['deleting', configId, tableId], true);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_DELETE_ROW_SUCCESS:
      ({ configId } = action);
      ({ tableId } = action);
      _store = _store.deleteIn(['deleting', configId, tableId]);
      _store = _store.deleteIn(['files', configId, tableId]);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_SAVEFILE_START:
      ({ configId } = action);
      ({ tableId } = action);
      _store = _store.setIn(['updating', 'files', configId, tableId], true);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_SAVEFILE_SUCCESS:
      ({ configId } = action);
      ({ tableId } = action);
      var files = fromJS(action.files);
      files = files.toMap().mapKeys((index, file) => file.get('tableId'));
      _store = _store.setIn(['files', configId], files);
      _store = _store.deleteIn(['updating', 'files', configId, tableId]);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_SET_EDITING:
      ({ configId } = action);
      var { path } = action;
      ({ data } = action);
      var editPath = ['editing', configId].concat(path);
      _store = _store.setIn(editPath, data);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_LOAD_FILES_SUCCESS:
      files = fromJS(action.files);
      ({ configId } = action);
      files = files.toMap().mapKeys((index, file) => file.get('tableId'));
      _store = _store.setIn(['files', configId], files);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_LOAD_GOOGLEINFO_START:
      var { googleId } = action;
      ({ configId } = action);
      _store = _store.setIn(['loading', 'googleInfo', configId, googleId], true);
      return WrGdriveStore.emitChange();

    case ActionTypes.WR_GDRIVE_LOAD_GOOGLEINFO_SUCCESS:
      ({ googleId } = action);
      ({ configId } = action);
      var googleInfo = fromJS(action.googleInfo);
      _store = _store.deleteIn(['loading', 'googleInfo', configId, googleId]);
      _store = _store.setIn(['googleInfo', configId, googleId], googleInfo);
      return WrGdriveStore.emitChange();
    default:
      break;
  }
});

export default WrGdriveStore;
