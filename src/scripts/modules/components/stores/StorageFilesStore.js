import Dispatcher from '../../../Dispatcher';
import { ActionTypes } from '../Constants';
const constants = { ActionTypes };
import Immutable from 'immutable';
const { Map, List } = Immutable;
import StoreUtils from '../../../utils/StoreUtils';

let _store = Map({
  files: List(),
  isLoaded: false,
  isLoading: false
});

const StorageFilesStore = StoreUtils.createStore({
  getAll() {
    return _store.get('files');
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
    case constants.ActionTypes.STORAGE_FILES_LOAD:
      _store = _store.set('isLoading', true);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('files', Immutable.fromJS(action.files))
          .set('isLoading', false)
          .set('isLoaded', true)
      );
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageFilesStore.emitChange();
    default:
  }
});

export default StorageFilesStore;
