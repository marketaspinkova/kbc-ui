import Dispatcher from '../../../Dispatcher';
import * as constants from '../Constants';
import { Map, fromJS } from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import { jobsLimit } from '../../storage-explorer/Constants';

let _store = initStore('StorageJobsStore', Map({
  jobs: Map(),
  hasMore: true,
  isLoading: false,
  isLoadingMore: false
}));

const StorageJobsStore = StoreUtils.createStore({
  getAll() {
    return _store.get('jobs')
      .toList()
      .sortBy((job) => -job.get('id'));
  },

  hasMore() {
    return _store.get('hasMore');
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoadingMore() {
    return _store.get('isLoadingMore');
  }
});

const jobsByIds = (jobs) => {
  return fromJS(jobs)
    .toMap()
    .mapKeys((key, val) => {
      return val.get('id');
    });
};

Dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.STORAGE_JOBS_LOAD:
      _store = _store.set('isLoading', true);
      return StorageJobsStore.emitChange();

    case constants.ActionTypes.STORAGE_JOBS_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('jobs', _store.get('jobs').merge(jobsByIds(action.jobs)))
          .set('hasMore', action.jobs.length === jobsLimit)
          .set('isLoading', false)
      );
      return StorageJobsStore.emitChange();

    case constants.ActionTypes.STORAGE_JOBS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageJobsStore.emitChange();

    case constants.ActionTypes.STORAGE_JOBS_LOAD_MORE:
      _store = _store.set('isLoadingMore', true);
      return StorageJobsStore.emitChange();

    case constants.ActionTypes.STORAGE_JOBS_LOAD_MORE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('jobs', _store.get('jobs').merge(jobsByIds(action.jobs)))
          .set('hasMore', action.jobs.length === jobsLimit)
          .set('isLoadingMore', false)
      );
      return StorageJobsStore.emitChange();

    case constants.ActionTypes.STORAGE_JOBS_LOAD_MORE_ERROR:
      _store = _store.set('isLoadingMore', false);
      return StorageJobsStore.emitChange();

    default:
  }
});

export default StorageJobsStore;
