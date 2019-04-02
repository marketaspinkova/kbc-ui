import StoreUtils from '../../../utils/StoreUtils';
import { Map, List, fromJS } from 'immutable';
import dispatcher from '../../../Dispatcher';
import { ActionTypes } from '../MetadataConstants';
import * as Constants from '../Constants';
import _ from 'underscore';

var _store = Map({
  savingMetadata: Map(),
  editingMetadata: Map(),
  metadata: Map(),
  filters: Map()
});

var MetadataStore = StoreUtils.createStore({

  getColumnMetadata: function(tableId, column, provider, metadataKey) {
    const columnId = tableId + '.' + column;
    return this.getMetadata('column', columnId, provider, metadataKey);
  },

  getAllColumnMetadata: function(tableId, column) {
    return this.getMetadataAll('column', tableId + '.' + column);
  },

  getAllTableMetadata: function(tableId) {
    return this.getMetadataAll('table', tableId);
  },

  getTableMetadata: function(tableId, provider, metadataKey) {
    return this.getMetadata('table', tableId, provider, metadataKey);
  },

  getTableColumnsMetadata: function(tableId) {
    return _store.getIn(['metadata', 'tableColumns', tableId], Map());
  },

  getAllTableColumnsMetadataByProvider: function(tableId, provider) {
    return this.getTableColumnsMetadata(tableId).map(
      (metadata) => metadata.filter(data => data.get('provider') === provider)
    );
  },

  getTableMetadataValue: function(tableId, provider, metadataKey) {
    return this.getTableMetadata(tableId, provider, metadataKey).get('value');
  },

  getMetadata: function(objectType, objectId, provider, metadataKey) {
    if (this.hasMetadata(objectType, objectId)) {
      var metadataList = this.getMetadataAll(objectType, objectId);
      return metadataList.find(
        metadata =>  (metadata.get('provider') === provider && metadata.get('key') === metadataKey)
      );
    }
    return false;
  },

  hasMetadata: function(objectType, objectId) {
    return _store.hasIn(['metadata', objectType, objectId]);
  },

  hasMetadataKey: function(objectType, objectId, metadataKey) {
    return _store.getIn(['metadata', objectType, objectId]).hasIn(['key', metadataKey]);
  },

  getMetadataAll: function(objectType, objectId) {
    return _store.getIn(['metadata', objectType, objectId], List());
  },

  hasProviderMetadata: function(objectType, objectId, provider, metadataKey) {
    var objectMetadata = this.getMetadata(objectType, objectId);
    var foundMetadata = objectMetadata.find(
      metadata =>  metadata.get('provider') === provider && metadata.get('key') === metadataKey
    );
    return !(typeof foundMetadata === 'undefined' || foundMetadata === null);
  },

  getMetadataValue: function(objectType, objectId, provider, metadataKey) {
    var metadata = this.getMetadata(objectType, objectId, provider, metadataKey);
    if (metadata) {
      return metadata.get('value');
    }
    return '';
  },

  getEditingMetadataValue: function(objectType, objectId, metadataKey) {
    return _store.getIn(['editingMetadata', objectType, objectId, metadataKey]);
  },

  isEditingMetadata: function(objectType, objectId, metadataKey) {
    return _store.hasIn(['editingMetadata', objectType, objectId, metadataKey]);
  },

  isSavingMetadata: function(objectType, objectId, metadataKey) {
    return _store.hasIn(['savingMetadata', objectType, objectId, metadataKey]);
  },

  getTableLastUpdatedInfo: function(tableId) {
    let componentFound = this.getTableMetadata(tableId, 'system', 'KBC.lastUpdatedBy.component.id');
    let configFound = this.getTableMetadata(tableId, 'system', 'KBC.lastUpdatedBy.configuration.id');
    if (!componentFound || !configFound) {
      componentFound = this.getTableMetadata(tableId, 'system', 'KBC.createdBy.component.id');
      configFound = this.getTableMetadata(tableId, 'system', 'KBC.createdBy.configuration.id');
    }
    const componentId = componentFound && componentFound.get('value');
    const configId = configFound && configFound.get('value');
    const timestamp = configFound && configFound.get('timestamp');
    if (!componentFound || !configFound) {
      return null;
    }
    return {
      'component': componentId,
      'config': configId,
      'timestamp': timestamp
    };
  },

  tableHasMetadataDatatypes: function(tableId) {
    const lastUpdateInfo = this.getTableLastUpdatedInfo(tableId);
    const tableColumnsMetadata = this.getTableColumnsMetadata(tableId);
    if (!tableColumnsMetadata || !lastUpdateInfo) {
      return false;
    }
    const columnsWithBaseTypes = tableColumnsMetadata.filter((metadataList) => {
      const columnHasDatatype = metadataList.filter((metadata) => {
        return metadata.get('provider') === lastUpdateInfo.component && metadata.get('key') === 'KBC.datatype.basetype';
      });
      return columnHasDatatype.count() > 0;
    });
    return columnsWithBaseTypes.count() > 0;
  },

  getLastUpdatedByColumnMetadata: function(tableId) {
    const lastUpdateInfo = this.getTableLastUpdatedInfo(tableId);
    if (!lastUpdateInfo) {
      return Map();
    }
    return this.getAllTableColumnsMetadataByProvider(tableId, lastUpdateInfo.component);
  },

  getUserProvidedColumnMetadata: function (tableId) {
    return this.getAllTableColumnsMetadataByProvider(tableId, 'user');
  }
});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {
    case ActionTypes.METADATA_EDIT_START:
      _store = _store.setIn(
        ['editingMetadata', action.objectType, action.objectId, action.metadataKey],
        MetadataStore.getMetadataValue(action.objectType, action.objectId, 'user', action.metadataKey)
      );
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_EDIT_UPDATE:
      _store = _store.setIn(
        ['editingMetadata', action.objectType, action.objectId, action.metadataKey],
        action.value
      );
      return MetadataStore.emitChange();
    case ActionTypes.METADATA_EDIT_STOP:
      _store = _store.deleteIn(['editingMetadata', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_EDIT_CANCEL:
      _store = _store.deleteIn(['editingMetadata', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_SAVE_START:
      _store = _store.setIn(['savingMetadata', action.objectType, action.objectId, action.metadataKey], action.value);
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_SAVE_ERROR:
      return MetadataStore.emitChange();

    case ActionTypes.METADATA_SAVE_SUCCESS:
      _store = _store.setIn(['metadata', action.objectType, action.objectId], fromJS(action.metadata));
      _store = _store.deleteIn(['savingMetadata', action.objectType, action.objectId, action.metadataKey]);
      if (action.objectType === 'column') {
        const [ tableId, columnName ] = action.objectId.split(/\.(?=[^\.]+$)/);
        _store = _store.setIn(['metadata', 'tableColumns', tableId, columnName], fromJS(action.metadata));
      }
      return MetadataStore.emitChange();

    case Constants.ActionTypes.STORAGE_BUCKETS_LOAD_SUCCESS:
      _.each(action.buckets, function(bucket) {
        _store = _store.setIn(['metadata', 'bucket', bucket.id], fromJS(bucket.metadata));
      });
      return MetadataStore.emitChange();

    case Constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS:
      _.each(action.tables, function(table) {
        const tableMetadata = fromJS(table.metadata);
        _store = _store.setIn(
          ['metadata', 'table', table.id], tableMetadata
        );
        _.each(table.columnMetadata, function(metadata, columnName) {
          _store = _store
            .setIn(['metadata', 'column', table.id + '.' + columnName], fromJS(metadata))
            .setIn(['metadata', 'tableColumns', table.id, columnName], fromJS(metadata));
        });
      });
      return MetadataStore.emitChange();
    default:
  }
});

export default MetadataStore;
