import { Map, Set } from 'immutable';
import StoreUtils, { initStore } from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = initStore('StorageBucketsLocalStore', Map({
  searchQuery: '',
  openedBuckets: Set(),
  isReloading: false
}));

const BucketsLocalStore = StoreUtils.createStore({
  getSearchQuery() {
    return _store.get('searchQuery', '');
  },

  getOpenedBuckets() {
    return _store.get('openedBuckets');
  },

  getIsReloading() {
    return _store.get('isReloading', false);
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.UPDATE_SEARCH_QUERY:
      _store = _store.set('searchQuery', action.query);
      return BucketsLocalStore.emitChange();

    case constants.ActionTypes.SET_OPENED_BUCKETS:
      _store = _store.set('openedBuckets', action.buckets);
      return BucketsLocalStore.emitChange();

    case constants.ActionTypes.RELOAD:
      _store = _store.set('isReloading', true);
      return BucketsLocalStore.emitChange();

    case constants.ActionTypes.RELOAD_SUCCESS:
    case constants.ActionTypes.RELOAD_ERROR:
      _store = _store.set('isReloading', false);
      return BucketsLocalStore.emitChange();

    default:
      break;
  }
});

export default BucketsLocalStore;
