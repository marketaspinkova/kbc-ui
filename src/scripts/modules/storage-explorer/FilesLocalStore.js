import { Map } from 'immutable';
import StoreUtils, { initStore } from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = initStore('StorageFilesLocalStore', Map({
  searchQuery: ''
}));

const FilesLocalStore = StoreUtils.createStore({
  getSearchQuery() {
    return _store.get('searchQuery', '');
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.UPDATE_FILES_SEARCH_QUERY:
      _store = _store.set('searchQuery', action.query);
      return FilesLocalStore.emitChange();

    default:
      break;
  }
});

export default FilesLocalStore;
