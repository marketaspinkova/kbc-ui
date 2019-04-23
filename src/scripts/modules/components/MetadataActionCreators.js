
import dispatcher from '../../Dispatcher';
import storageApi from './StorageApi';
import { ActionTypes } from './MetadataConstants';
import Immutable from 'immutable';

var Map = Immutable.Map;

export default {
  updateEditingMetadata(objectType, objectId, metadataKey, value) {
    dispatcher.handleViewAction({
      type: ActionTypes.METADATA_EDIT_UPDATE,
      objectType,
      objectId,
      metadataKey,
      value
    });
  },

  cancelMetadataEdit(objectType, objectId, metadataKey) {
    dispatcher.handleViewAction({
      type: ActionTypes.METADATA_EDIT_CANCEL,
      objectType,
      objectId,
      metadataKey
    });
  },

  saveMetadata(objectType, objectId, metadataKey, newValue) {
    dispatcher.handleViewAction({
      type: ActionTypes.METADATA_SAVE,
      objectType,
      objectId,
      metadataKey
    });
    return storageApi
      .saveMetadata(objectType, objectId, Map([[metadataKey, newValue]]))
      .then((metadata) => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_SAVE_SUCCESS,
          objectType,
          objectId,
          metadataKey,
          metadata
        });
        return metadata;
      })
      .catch((error) => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_SAVE_ERROR,
          objectType,
          objectId,
          metadataKey
        });
        throw error;
      });
  },

  saveMetadataSet(objectType, objectId, metadata) {
    return storageApi
      .saveMetadata(objectType, objectId, metadata)
      .then((metadata) => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_SAVE_SUCCESS,
          objectType,
          objectId,
          metadata
        });
        return metadata;
      })
      .catch((error) => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_SAVE_ERROR,
          objectType,
          objectId,
          metadata
        });
        throw error;
      });
  },

  deleteMetadata(objectType, objectId, metadataKey) {
    return storageApi
      .deleteMetadata(objectType, objectId, metadataKey)
      .then(() => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_DELETE_SUCCESS,
          objectType,
          objectId,
          metadataKey
        });
      })
      .catch((error) => {
        dispatcher.handleViewAction({
          type: ActionTypes.METADATA_DELETE_ERROR,
          objectType,
          objectId,
          metadataKey
        });
        throw error;
      });
  }
};
