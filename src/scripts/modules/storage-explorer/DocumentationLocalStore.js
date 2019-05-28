import { Map, fromJS } from 'immutable';
import StoreUtils, { initStore } from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = initStore('StorageDocumentationLocalStore', Map({
  searchQuery: '',
  lastSnapshot: null,
  openedRows: Map() // rowType -> name
}));

const DocumentationLocalStore = StoreUtils.createStore({
  getSearchQuery() {
    return _store.get('searchQuery', '');
  },

  getOpenedRows() {
    return _store.get('openedRows');
  },

  getLastSnapshot() {
    return _store.get('lastSnapshot');
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.DOCUMENTATION_UPDATE_SEARCH_QUERY:
      _store = _store.set('searchQuery', action.query);
      return DocumentationLocalStore.emitChange();

    case constants.ActionTypes.DOCUMENTATION_TOGGLE_OPENED_ROWS:
      _store = _store.setIn(['openedRows', action.rowId], action.isOpen);
      return DocumentationLocalStore.emitChange();

    case constants.ActionTypes.DOCUMENTATION_LOAD_SNAPSHOTS_SUCCESS:
      _store= _store.set('lastSnapshot', null);
      if (action.files.length > 0) {
        _store= _store.set('lastSnapshot', fromJS(action.files[0]));
      }
      return DocumentationLocalStore.emitChange();
    case constants.ActionTypes.DOCUMENTATION_LOAD_SNAPSHOTS_ERROR:
      _store = _store.deleteIn(['lastSnapshot', null]);
      return DocumentationLocalStore.emitChange();


    default:
      break;
  }
});

export default DocumentationLocalStore;
