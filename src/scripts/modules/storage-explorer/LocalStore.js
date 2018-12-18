import { Map } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = Map({
  searchQuery: ''
});

const LocalStore = StoreUtils.createStore({
  getSearchQuery() {
    return _store.get('searchQuery', '');
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.UPDATE_SEARCH_QUERY:
      _store = _store.set('searchQuery', action.query);
      return LocalStore.emitChange();

    default:
      break;
  }
});

export default LocalStore;
