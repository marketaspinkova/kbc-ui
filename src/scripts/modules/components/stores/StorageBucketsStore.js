import Dispatcher from '../../../Dispatcher';
import { ActionTypes } from '../Constants';
const constants = { ActionTypes };

import Immutable from 'immutable';
const { Map } = Immutable;
const { List } = Immutable;
const { fromJS } = Immutable;
import StoreUtils from '../../../utils/StoreUtils';
import _ from 'underscore';

let _store = Map({
  buckets: Map(),
  isLoaded: false,
  isLoading: false,
  credentials: Map(), // bucketId
  pendingCredentials: Map(), // (loading, deleting, creating)
  pendingBuckets: Map() // (creating)
});

const StorageBucketsStore = StoreUtils.createStore({
  getAll() {
    return _store.get('buckets');
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  hasBucket(bucketId) {
    return _store.get('buckets').has(bucketId);
  },

  isCreatingBucket() {
    return _store.getIn(['pendingBuckets', 'creating'], false);
  },

  deletingBuckets() {
    return _store.getIn(['pendingBuckets', 'deleting'], Map());
  },

  hasCredentials(bucketId) {
    return _store.get('credentials').has(bucketId);
  },

  getCredentials(bucketId) {
    return _store.getIn(['credentials', bucketId]);
  },

  isCreatingCredentials() {
    return _store.getIn(['pendingCredentials', 'creating'], false);
  },

  isDeletingCredentials() {
    return _store.getIn(['pendingCredentials', 'deleting'], false);
  },

  isSharing(bucketId) {
    return _store.getIn(['pendingCredentials', 'sharing', bucketId], false);
  },

  isUnsharing(bucketId) {
    return _store.getIn(['pendingCredentials', 'unsharing', bucketId], false);
  },

  getBucketMetadata(bucketId) {
    return _store.get('buckets').getIn(bucketId, 'metadata');
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.STORAGE_BUCKETS_LOAD:
      _store = _store.set('isLoading', true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKETS_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store.setIn(['buckets'], Map());
        _.each(action.buckets, function(bucket) {
          const bObj = Immutable.fromJS(bucket);
          return storeResult.setIn(['buckets', bObj.get('id')], bObj);
        });
        store.set('isLoading', false);
        return store.set('isLoaded', true);
      });
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKETS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE:
      var { bucketId } = action;
      _store = _store.setIn(['pendingCredentials', 'creating'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE_SUCCESS:
      ({ bucketId } = action);
      var newCreds = fromJS(action.credentials);
      _store = _store.setIn(['pendingCredentials', 'creating'], false);
      var creds = StorageBucketsStore.getCredentials(bucketId) || List();
      _store = _store.setIn(['credentials', bucketId], creds.push(newCreds));
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD:
      ({ bucketId } = action);
      _store = _store.setIn(['pendingCredentials', bucketId, 'loading'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD_SUCCESS:
      ({ bucketId } = action);
      var credentials = fromJS(action.credentials);
      _store = _store.deleteIn(['pendingCredentials', bucketId, 'loading']);

      _store = _store.setIn(['credentials', bucketId], credentials);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE:
      ({ bucketId } = action);
      var { credentialsId } = action;
      _store = _store.setIn(['pendingCredentials', 'deleting'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE_SUCCESS:
      ({ bucketId } = action);
      ({ credentialsId } = action);
      _store = _store.deleteIn(['pendingCredentials', 'deleting']);
      creds = StorageBucketsStore.getCredentials(bucketId).filter(c => c.get('id') !== credentialsId);
      _store = _store.setIn(['credentials', bucketId], creds);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE:
      _store = _store.setIn(['pendingBuckets', 'creating'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE_SUCCESS:
      _store = _store.setIn(['pendingBuckets', 'creating'], false);
      _store = _store.setIn(['buckets', action.bucket.id], Immutable.fromJS(action.bucket));
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR:
      _store = _store.setIn(['pendingBuckets', 'creating'], false);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE:
      _store = _store.setIn(['pendingBuckets', 'deleting', action.bucketId], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE_SUCCESS:
      _store = _store.removeIn(['pendingBuckets', 'deleting', action.bucketId]);
      _store = _store.removeIn(['buckets', action.bucketId]);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE_ERROR:
      _store = _store.removeIn(['pendingBuckets', 'deleting', action.bucketId]);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_SHARE:
      _store = _store.setIn(['pendingBuckets', 'sharing', action.bucketId], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_SHARE_SUCCESS:
    case constants.ActionTypes.STORAGE_BUCKET_SHARE_ERROR:
      _store = _store.removeIn(['pendingBuckets', 'sharing', action.bucketId]);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_UNSHARE:
      _store = _store.setIn(['pendingBuckets', 'unsharing', action.bucketId], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_UNSHARE_SUCCESS:
    case constants.ActionTypes.STORAGE_BUCKET_UNSHARE_ERROR:
      _store = _store.removeIn(['pendingBuckets', 'unsharing', action.bucketId]);
      return StorageBucketsStore.emitChange();

    default:
  }
});

export default StorageBucketsStore;
