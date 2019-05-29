import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import { Map } from 'immutable';
import dispatcher from '../../../Dispatcher';
import { ActionTypes } from '../MetadataConstants';

var _store = initStore('MetadataStore', Map({
  editing: Map(),
  isSaving: Map()
}));

var MetadataStore = StoreUtils.createStore({
  getEditingValue(objectType, objectId, metadataKey) {
    return _store.getIn(['editing', objectType, objectId, metadataKey]);
  },

  isEditing(objectType, objectId, metadataKey) {
    return _store.hasIn(['editing', objectType, objectId, metadataKey]);
  },

  isSaving(objectType, objectId, metadataKey) {
    return _store.getIn(['isSaving', objectType, objectId, metadataKey], false);
  }
});

dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.type) {
    case ActionTypes.METADATA_EDIT_UPDATE:
      _store = _store.setIn(['editing', action.objectType, action.objectId, action.metadataKey], action.value);
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_EDIT_CANCEL:
      _store = _store.deleteIn(['editing', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();
    
    case ActionTypes.METADATA_SAVE:
      _store = _store.setIn(['isSaving', action.objectType, action.objectId, action.metadataKey], true);
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_SAVE_SUCCESS:
    case ActionTypes.METADATA_SAVE_ERROR:
    case ActionTypes.METADATA_DELETE_SUCCESS:
    case ActionTypes.METADATA_DELETE_ERROR:
      _store = _store.deleteIn(['editing', action.objectType, action.objectId, action.metadataKey]);
      _store = _store.deleteIn(['isSaving', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    default:
  }
});

export default MetadataStore;
