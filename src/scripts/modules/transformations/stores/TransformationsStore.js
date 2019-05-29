import Dispatcher from '../../../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import { ActionTypes as InstalledComponentsActionTypes } from '../../components/Constants';
import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import _ from 'underscore';
import parseBuckets from '../utils/parseBuckets';

let _store = initStore('TransformationsStore', Map({
  transformationsByBucketId: Map(),
  loadingTransformationBuckets: List(),
  pendingActions: Map(),
  overviews: Map(),
  loadingOverviews: Map(),
  showDisabledOverviews: Map(),
  openInputMappings: Map(),
  openOutputMappings: Map(),
  editingTransformationsFields: Map()
}));

const enhanceTransformation = transformation => {
  if (transformation.get('backend') === 'docker') {
    return transformation.set('queriesString', transformation.get('queries').join('\n'));
  } else {
    return transformation.set('queriesString', transformation.get('queries').join('\n\n'));
  }
};

const TransformationsStore = StoreUtils.createStore({
  getAllTransformations() {
    return _store.getIn(['transformationsByBucketId'], List());
  },

  getTransformations(bucketId) {
    return _store.getIn(['transformationsByBucketId', bucketId], List()).sortBy(transformation => {
      const phase = transformation.get('phase', 0);
      const name = transformation.get('name', '');
      return phase + name.toLowerCase();
    });
  },

  hasTransformations(bucketId) {
    return _store.get('transformationsByBucketId').has(bucketId);
  },

  getTransformation(bucketId, transformationId) {
    return _store.getIn(['transformationsByBucketId', bucketId, transformationId]);
  },

  getTransformationEditingFields(bucketId, transformationId) {
    return _store.getIn(['editingTransformationsFields', bucketId, transformationId], Map());
  },

  isTransformationEditingName(bucketId, transformationId) {
    return _store.getIn(['editingTransformationsName', bucketId, transformationId], false);
  },

  hasTransformation(bucketId, transformationId) {
    return _store.hasIn(['transformationsByBucketId', bucketId, transformationId]);
  },

  /*
    Test if specified transformation buckets are currently being loaded
  */
  isBucketLoading(bucketId) {
    return _store.get('loadingTransformationBuckets').contains(bucketId);
  },

  getAllPendingActions() {
    return _store.getIn(['pendingActions'], Map());
  },

  getPendingActions(bucketId) {
    return _store.getIn(['pendingActions', bucketId], Map());
  },

  getTransformationPendingActions(bucketId, transformationId) {
    return _store.getIn(['pendingActions', bucketId, transformationId], Map());
  },

  getOverview(bucketId, transformationId) {
    return _store.getIn(['overviews', bucketId, transformationId]);
  },

  isOverviewLoading(bucketId, transformationId) {
    return !!_store.getIn(['loadingOverviews', bucketId, transformationId]);
  },

  isShowDisabledInOverview(bucketId, transformationId) {
    if (_store.getIn(['showDisabledOverviews', bucketId, transformationId]) === true) {
      return true;
    }
    if (_store.getIn(['showDisabledOverviews', bucketId, transformationId]) === false) {
      return false;
    }
    return _store.getIn(['transformationsByBucketId', bucketId, transformationId, 'disabled'], false);
  },

  isInputMappingOpen(bucketId, transformationId, index) {
    return _store.getIn(['openInputMappings', bucketId, transformationId, index], false);
  },

  isInputMappingClosed(bucketId, transformationId, index) {
    return _store.getIn(['openOutputMappings', bucketId, transformationId, index], false);
  },

  getOpenInputMappings(bucketId, transformationId) {
    return _store.getIn(['openInputMappings', bucketId, transformationId], Map());
  },

  getOpenOutputMappings(bucketId, transformationId) {
    return _store.getIn(['openOutputMappings', bucketId, transformationId], Map());
  },

  getTransformationEditingIsValid(bucketId, transformationId) {
    const transformation = this.getTransformation(bucketId, transformationId);
    if (!transformation) {
      return;
    }
    if (transformation.get('backend') === 'docker' && transformation.get('type') === 'openrefine') {
      const scriptsString = _store.getIn(
        ['editingTransformationsFields', bucketId, transformationId, 'queriesString'],
        ''
      );
      try {
        JSON.parse(scriptsString);
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  },

  getTransformationDescription(bucketId, transformationId) {
    let description = InstalledComponentsStore.getConfigRow('transformation', bucketId, transformationId).get(
      'description'
    );
    if (description === '') {
      description = this.getTransformation(bucketId, transformationId).get('description');
    }
    return description;
  },

  getTransformationName(bucketId, transformationId) {
    let name = InstalledComponentsStore.getConfigRow('transformation', bucketId, transformationId).get('name');
    if (name === '') {
      name = this.getTransformation(bucketId, transformationId).get('name');
    }
    return name;
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case ActionTypes.TRANSFORMATION_CREATE_SUCCESS:
      _store = _store.setIn(
        ['transformationsByBucketId', action.bucketId, action.transformation.id],
        enhanceTransformation(fromJS(action.transformation))
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_OVERVIEW_LOAD:
      _store = _store.setIn(['loadingOverviews', action.bucketId, action.transformationId], true);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_OVEWVIEW_LOAD_ERROR:
      _store = _store.setIn(['loadingOverviews', action.bucketId, action.transformationId], false);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .setIn(['overviews', action.bucketId, action.transformationId], fromJS(action.model))
          .setIn(['loadingOverviews', action.bucketId, action.transformationId], false)
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_OVERVIEW_SHOW_DISABLED:
      _store = _store.setIn(['showDisabledOverviews', action.bucketId, action.transformationId], action.showDisabled);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_DELETE:
      _store = _store.setIn(['pendingActions', action.bucketId, action.transformationId, 'delete'], true);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_DELETE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .removeIn(['transformationsByBucketId', action.bucketId, action.transformationId])
          .removeIn(['pendingActions', action.bucketId, action.transformationId, 'delete'])
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_DELETE_ERROR:
      _store = _store.removeIn(['pendingActions', action.bucketId, action.transformationId, 'delete']);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_INPUT_MAPPING_OPEN_TOGGLE:
      if (_store.getIn(['openInputMappings', action.bucketId, action.transformationId, action.index], false)) {
        _store = _store.setIn(['openInputMappings', action.bucketId, action.transformationId, action.index], false);
      } else {
        _store = _store.setIn(['openInputMappings', action.bucketId, action.transformationId, action.index], true);
      }
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_OUTPUT_MAPPING_OPEN_TOGGLE:
      if (_store.getIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], false)) {
        _store = _store.setIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], false);
      } else {
        _store = _store.setIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], true);
      }
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_EDIT_SAVE_START:
      _store = _store.setIn(['pendingActions', action.bucketId, action.transformationId, action.pendingAction], true);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS:
      _store = _store.withMutations(store => {
        const tObj = enhanceTransformation(fromJS(action.data));
        store
          .setIn(['transformationsByBucketId', action.bucketId, action.transformationId], tObj)
          .deleteIn(['pendingActions', action.bucketId, action.transformationId, action.pendingAction]);

        if (action.editingId) {
          store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, action.editingId]);

          if (action.editingId === 'queries') {
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'splitQueries']);
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'queriesString']);
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'queriesChanged']);
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'description']);
          } else if (action.editingId === 'packages') {
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'packagesChanged']);
          } else if (action.editingId === 'tags') {
            store.deleteIn(['editingTransformationsFields', action.bucketId, action.transformationId, 'tagsChanged']);
          }
        }
      });

      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.bucketId, action.transformationId, action.pendingAction]);
      return TransformationsStore.emitChange();

    case InstalledComponentsActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS:
      if (action.componentId !== 'transformation') {
        return;
      }
      const bucketsData = parseBuckets(action.configData);
      _store = _store.withMutations(store => {
        store.delete('transformationsByBucketId');
        return _.each(bucketsData, bucket =>
          _.each(bucket.transformations, transformation => {
            const tObj = enhanceTransformation(fromJS(transformation));
            return store.setIn(['transformationsByBucketId', bucket.id, tObj.get('id')], tObj);
          })
        );
      });
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_START_EDIT_FIELD:
      _store = _store.setIn(
        ['editingTransformationsFields', action.bucketId, action.transformationId, action.fieldId],
        _store.getIn(['transformationsByBucketId', action.bucketId, action.transformationId, action.fieldId], Map())
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_UPDATE_EDITING_FIELD:
      _store = _store.setIn(
        ['editingTransformationsFields', action.bucketId, action.transformationId, action.fieldId],
        action.newValue
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_CANCEL_EDITING_FIELD:
      _store = _store.deleteIn([
        'editingTransformationsFields',
        action.bucketId,
        action.transformationId,
        action.fieldId
      ]);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES:
      _store = _store.setIn(['pendingActions', action.bucketId, action.transformationId, 'queries-processing'], true);
      _store = _store.setIn(
        ['editingTransformationsFields', action.bucketId, action.transformationId, 'splitQueries'],
        fromJS([action.queriesString])
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_SUCCESS:
      _store = _store.deleteIn(['pendingActions', action.bucketId, action.transformationId, 'queries-processing']);
      _store = _store.setIn(
        ['editingTransformationsFields', action.bucketId, action.transformationId, 'splitQueries'],
        fromJS(action.splitQueries)
      );
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_ERROR:
      _store = _store.deleteIn(['pendingActions', action.bucketId, action.transformationId, 'queries-processing']);
      return TransformationsStore.emitChange();

    case ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS:
      _store = _store.withMutations(store => store.removeIn(['transformationsByBucketId', action.bucketId]));
      return TransformationsStore.emitChange();

    default:
  }
});

export default TransformationsStore;
