import { Map, Set } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = Map({
  openedBuckets: Set()
});

const ColumnsLocalStore = StoreUtils.createStore({
  getOpenedColumns() {
    return _store.get('openedBuckets');
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.UPDATE_SEARCH_QUERY:
      _store = _store.set('searchQuery', action.query);
      return ColumnsLocalStore.emitChange();

    case constants.ActionTypes.SET_OPENED_COLUMNS:
      _store = _store.set('openedColumns', action.columns);
      return ColumnsLocalStore.emitChange();

    default:
      break;
  }
});

export default ColumnsLocalStore;
