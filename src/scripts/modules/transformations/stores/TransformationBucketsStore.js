import Dispatcher from '../../../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import { ActionTypes as InstalledComponentsActionTypes } from '../../components/Constants';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import parseBuckets from '../utils/parseBuckets';

let _store = initStore('TransformationBucketsStore', Map({
  bucketsById: Map(),
  isLoading: false,
  isLoaded: false,
  loadingBuckets: List(),
  pendingActions: Map(), // by bucket id id
  filters: Map(),
  toggles: Map()
}));

const TransformationBucketsStore = StoreUtils.createStore({
  getAll() {
    return _store.get('bucketsById').sortBy(bucket => bucket.get('name'));
  },

  get(id) {
    return _store.getIn(['bucketsById', id]);
  },

  has(id) {
    return _store.get('bucketsById').has(id);
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  getPendingActions() {
    return _store.get('pendingActions');
  },

  getPendingActionsForBucket(bucketId) {
    return this.getPendingActions().get(bucketId, Map());
  },

  getTransformationBucketsFilter() {
    return _store.getIn(['filters', 'buckets'], '');
  },

  getToggles() {
    return _store.getIn(['toggles'], Map());
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case InstalledComponentsActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD:
      if (action.componentId !== 'transformation') {
        return;
      }
      _store = _store.set('isLoading', true);
      return TransformationBucketsStore.emitChange();

    case InstalledComponentsActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS:
      if (action.componentId !== 'transformation') {
        return;
      }
      const bucketsData = parseBuckets(action.configData);
      _store = _store.withMutations(store =>
        store
          .set('isLoading', false)
          .set('isLoaded', true)
          .set(
            'bucketsById',
            fromJS(bucketsData)
              .toMap()
              .mapKeys((key, bucket) => bucket.get('id'))
          )
      );
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKET_CREATE_SUCCESS:
      _store = _store.setIn(['bucketsById', action.bucket.id], fromJS(action.bucket));
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKET_DELETE:
      _store = _store.setIn(['pendingActions', action.bucketId, 'delete'], true);
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKET_DELETE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.bucketId, 'delete']);
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS:
      _store = _store.withMutations(store =>
        store.removeIn(['bucketsById', action.bucketId]).removeIn(['pendingActions', action.bucketId, 'delete'])
      );
      return TransformationBucketsStore.emitChange();

    case ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE:
      _store = _store.setIn(['pendingActions', action.bucketId, 'restore'], true);
      return TransformationBucketsStore.emitChange();

    case ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.bucketId, 'restore']);
      return TransformationBucketsStore.emitChange();

    case ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_SUCCESS:
      _store = _store.withMutations(store => store.removeIn(['pendingActions', action.bucketId, 'restore']));
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKETS_FILTER_CHANGE:
      _store = _store.setIn(['filters', 'buckets'], action.filter);
      return TransformationBucketsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKETS_TOGGLE:
      const current = _store.getIn(['toggles', action.bucketId], false);
      _store = _store.setIn(['toggles', action.bucketId], !current);
      return TransformationBucketsStore.emitChange();

    case InstalledComponentsActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_SUCCESS:
      // propagate bucket name change from installed components
      if (action.componentId === 'transformation' && action.field === 'name') {
        return (_store = _store.setIn(
          ['bucketsById', action.configurationId, action.field],
          action.data[action.field]
        ));
      }
      break;

    default:
  }
});

export default TransformationBucketsStore;
