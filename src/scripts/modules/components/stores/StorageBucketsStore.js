import { Map, List, fromJS }  from 'immutable';
import Dispatcher from '../../../Dispatcher';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import * as metadataConstants from '../MetadataConstants';
import * as constants from '../Constants';

let _store = initStore('StorageBucketsStore', Map({
  buckets: Map(),
  isLoaded: false,
  isLoading: false,
  credentials: Map(), // bucketId
  pendingCredentials: Map(), // (loading, deleting, creating)
  pendingBuckets: Map(), // (creating)
  sharedBuckets: Map()
}));

const StorageBucketsStore = StoreUtils.createStore({
  getAll() {
    return _store.get('buckets');
  },

  getSharedBuckets() {
    return _store.get('sharedBuckets');
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
    return _store.getIn(['pendingBuckets', 'sharing', bucketId], false);
  },

  isUnsharing(bucketId) {
    return _store.getIn(['pendingBuckets', 'unsharing', bucketId], false);
  },

  isChangingSharingType(bucketId) {
    return _store.getIn(['pendingBuckets', 'isChangingSharingType', bucketId], false);
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
      _store = _store.withMutations((store) => {
        store.setIn(['buckets'], Map());
        action.buckets.forEach((bucket) => {
          store.setIn(['buckets', bucket.id], fromJS(bucket));
        });
        store.set('isLoading', false);
        store.set('isLoaded', true);
      });
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKETS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE:
      _store = _store.setIn(['pendingCredentials', 'creating'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE_SUCCESS:
      _store = _store.setIn(['pendingCredentials', 'creating'], false);
      _store = _store.setIn(['credentials', action.bucketId], 
        (StorageBucketsStore.getCredentials(action.bucketId) || List()).push(fromJS(action.credentials))
      );
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD:
      _store = _store.setIn(['pendingCredentials', action.bucketId, 'loading'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD_SUCCESS:
      _store = _store.deleteIn(['pendingCredentials', action.bucketId, 'loading']);
      _store = _store.setIn(['credentials', action.bucketId], fromJS(action.credentials));
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE:
      _store = _store.setIn(['pendingCredentials', 'deleting'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE_SUCCESS:
      _store = _store.deleteIn(['pendingCredentials', 'deleting']);
      _store = _store.setIn(['credentials', action.bucketId], 
        (StorageBucketsStore.getCredentials(action.bucketId) || List()).filter(c => c.get('id') !== action.credentialsId)
      );
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE:
      _store = _store.setIn(['pendingBuckets', 'creating'], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE_SUCCESS:
      _store = _store.setIn(['pendingBuckets', 'creating'], false);
      _store = _store.setIn(['buckets', action.bucket.id], fromJS(action.bucket));
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR:
      _store = _store.setIn(['pendingBuckets', 'creating'], false);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE:
      _store = _store.setIn(['pendingBuckets', 'deleting', action.bucketId], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE_SUCCESS:
      _store = _store.deleteIn(['pendingBuckets', 'deleting', action.bucketId]);
      _store = _store.deleteIn(['buckets', action.bucketId]);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_DELETE_ERROR:
      _store = _store.deleteIn(['pendingBuckets', 'deleting', action.bucketId]);
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

    case constants.ActionTypes.STORAGE_BUCKET_CHANGE_SHARING_TYPE:
      _store = _store.setIn(['pendingBuckets', 'isChangingSharingType', action.bucketId], true);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_BUCKET_CHANGE_SHARING_TYPE_SUCCESS:
    case constants.ActionTypes.STORAGE_BUCKET_CHANGE_SHARING_TYPE_ERROR:
      _store = _store.deleteIn(['pendingBuckets', 'isChangingSharingType', action.bucketId]);
      return StorageBucketsStore.emitChange();

    case constants.ActionTypes.STORAGE_SHARED_BUCKETS_LOAD_SUCCESS:
      _store = _store.set('sharedBuckets', fromJS(action.sharedBuckets));
      return StorageBucketsStore.emitChange();

    case metadataConstants.ActionTypes.METADATA_SAVE_SUCCESS:
      if (action.objectType === 'bucket') {
        _store = _store.setIn(['buckets', action.objectId, 'metadata'], fromJS(action.metadata));
        return StorageBucketsStore.emitChange();
      }
      break;

    default:
  }
});

export default StorageBucketsStore;
