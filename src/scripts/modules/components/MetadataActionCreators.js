
import dispatcher from '../../Dispatcher';
import storageApi from './StorageApi';
import MetadataStore from './stores/MetadataStore';
import Constants from './MetadataConstants';
import Immutable from 'immutable';

var Map = Immutable.Map;

export default {
  startMetadataEdit: function(objectType, objectId, metadataKey) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.METADATA_EDIT_START,
      objectType: objectType,
      objectId: objectId,
      metadataKey: metadataKey
    });
  },

  cancelMetadataEdit: function(objectType, objectId, metadataKey) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.METADATA_EDIT_CANCEL,
      objectType: objectType,
      objectId: objectId,
      metadataKey: metadataKey
    });
  },

  updateEditingMetadata: function(objectType, objectId, metadataKey, value) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.METADATA_EDIT_UPDATE,
      objectType: objectType,
      objectId: objectId,
      metadataKey: metadataKey,
      value: value
    });
  },

  saveMetadata: function(objectType, objectId, metadataKey) {
    dispatcher.handleViewAction({
      objectType: objectType,
      objectId: objectId,
      metadataKey: metadataKey,
      type: Constants.ActionTypes.METADATA_SAVE_START
    });
    var newValue = MetadataStore.getEditingMetadataValue(objectType, objectId, metadataKey);
    return storageApi.saveMetadata(objectType, objectId, Map([[metadataKey, newValue]])).then(function(result) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.METADATA_SAVE_SUCCESS,
        objectType: objectType,
        objectId: objectId,
        metadataKey: metadataKey,
        metadata: result
      });
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.METADATA_EDIT_STOP,
        objectType: objectType,
        objectId: objectId,
        metadataKey: metadataKey
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.METADATA_SAVE_ERROR,
        objectType: objectType,
        objectId: objectId,
        metadataKey: metadataKey,
        value: newValue
      });
      throw error;
    });
  }
};
