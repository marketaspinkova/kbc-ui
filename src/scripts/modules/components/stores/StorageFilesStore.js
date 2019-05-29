import Dispatcher from '../../../Dispatcher';
import * as constants from '../Constants';
import { Map, List, fromJS } from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import { filesLimit } from '../../storage-explorer/Constants';

let _store = initStore('StorageFilesStore', Map({
  files: List(),
  hasMoreFiles: true,
  isLoaded: false,
  isLoading: false,
  uploadingProgress: Map(),
  isLoadingMore: false,
  isDeleting: Map()
}));

const StorageFilesStore = StoreUtils.createStore({
  getAll() {
    return _store.get('files');
  },

  hasMoreFiles() {
    return _store.get('hasMoreFiles');
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsDeleting() {
    return _store.get('isDeleting', Map());
  },

  getIsLoadingMore() {
    return _store.get('isLoadingMore');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  getUploadingProgress(id) {
    return _store.getIn(['uploadingProgress', id]);
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
          .set('files', fromJS(action.files))
          .set('hasMoreFiles', action.files.length === filesLimit)
          .set('isLoading', false)
          .set('isLoaded', true)
      );
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILE_UPLOAD:
      _store = _store.setIn(['uploadingProgress', action.id], action.progress);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILE_UPLOAD_SUCCESS:
    case constants.ActionTypes.STORAGE_FILE_UPLOAD_ERROR:
      _store = _store.deleteIn(['uploadingProgress', action.id]);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_MORE:
      _store = _store.set('isLoadingMore', true);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_MORE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('files', _store.get('files').concat(fromJS(action.files)))
          .set('hasMoreFiles', action.files.length === filesLimit)
          .set('isLoadingMore', false)
      );
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILES_LOAD_MORE_ERROR:
      _store = _store.set('isLoadingMore', false);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILE_DELETE:
      _store = _store.setIn(['isDeleting', action.fileId], true);
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILE_DELETE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('files', _store.get('files').filter(file => file.get('id') !== action.fileId))
          .deleteIn(['isDeleting', action.fileId])
      );
      return StorageFilesStore.emitChange();

    case constants.ActionTypes.STORAGE_FILE_DELETE_ERROR:
      _store = _store.deleteIn(['isDeleting', action.fileId]);
      return StorageFilesStore.emitChange();
    default:
  }
});

export default StorageFilesStore;
