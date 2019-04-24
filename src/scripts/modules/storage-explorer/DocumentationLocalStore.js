import { Map } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = Map({
  searchQuery: '',
  openedRows: Map() // rowType -> name
});

const DocumentationLocalStore = StoreUtils.createStore({
  getSearchQuery() {
    return _store.get('searchQuery', '');
  },

  getOpenedRows() {
    return _store.get('openedRows');
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

    default:
      break;
  }
});

export default DocumentationLocalStore;
