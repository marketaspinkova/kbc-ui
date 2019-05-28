import { Map, fromJS } from 'immutable';
import Dispatcher from '../../../Dispatcher';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import * as metadataConstants from '../MetadataConstants';
import * as constants from '../Constants';

let _store = initStore('StorageTablesStore', Map({
  tables: Map(),
  tablesUsages: Map(),
  isLoaded: false,
  isLoading: false,
  pendingTables: Map() // (creating/loading)
}));

const StorageTablesStore = StoreUtils.createStore({
  getAll() {
    return _store.get('tables');
  },

  getAllUsages() {
    return _store.get('tablesUsages');
  },

  hasTable(tableId) {
    return _store.get('tables').has(tableId);
  },

  getTable(tableId, defaultValue) {
    return _store.getIn(['tables', tableId], defaultValue);
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  getIsCreatingTable() {
    return _store.getIn(['pendingTables', 'creating'], false);
  },

  getIsTruncatingTable(tableId) {
    return _store.getIn(['pendingTables', 'truncatingTable', tableId], false);
  },

  getAddingColumn() {
    return _store.getIn(['pendingTables', 'addingColumn'], Map());
  },

  getDeletingColumn() {
    return _store.getIn(['pendingTables', 'deletingColumn'], Map());
  },

  getIsDeletingTable() {
    return _store.getIn(['pendingTables', 'deleting'], false);
  },

  getIsCreatingAliasTable() {
    return _store.getIn(['pendingTables', 'creatingAlias'], false);
  },

  getIsSettingAliasFilter(tableId) {
    return _store.getIn(['pendingTables', 'settingAliasFilter', tableId], false);
  },

  getIsRemovingAliasFilter(tableId) {
    return _store.getIn(['pendingTables', 'removingAliasFilter', tableId], false);
  },

  getIsCreatingPrimaryKey(tableId) {
    return _store.getIn(['pendingTables', 'creatingPrimaryKey', tableId], false);
  },

  getIsDeletingPrimaryKey(tableId) {
    return _store.getIn(['pendingTables', 'deletingPrimaryKey', tableId], false);
  },

  getIsLoadingTable() {
    return _store.getIn(['pendingTables', 'loading'], false);
  },

  getIsCreatingSnapshot(tableId) {
    return _store.getIn(['pendingTables', 'creatingSnapshot', tableId], false);
  },

  getIsRestoringTable(tableId) {
    return _store.getIn(['pendingTables', 'restoring', tableId], false);
  },

  getIsCreatingFromSnapshot() {
    return _store.getIn(['pendingTables', 'creatingFromSnapshot'], Map());
  },

  getIsDeletingSnapshot() {
    return _store.getIn(['pendingTables', 'deletingSnapshot'], Map());
  },

  getIsExportingTable(tableId) {
    return _store.getIn(['pendingTables', 'exporting', tableId], false);
  },

  getTableMetadata(tableId) {
    return _store.get('tables').getIn(tableId, 'metadata');
  },

  getColumnMetadata(tableId) {
    return _store.get('tables').getIn(tableId, 'columnMetadata');
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.STORAGE_TABLES_LOAD:
      _store = _store.set('isLoading', true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS:
      _store = _store.withMutations((store) => {
        store.setIn(['tables'], Map());
        action.tables.forEach((table) => {
          store.setIn(['tables', table.id], fromJS(table));
        });
        store.set('isLoading', false).set('isLoaded', true);
      });
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLES_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE:
      _store = _store.setIn(['pendingTables', 'creating'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR:
      _store = _store.deleteIn(['pendingTables', 'creating']);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TRUNCATE_TABLE:
      _store = _store.setIn(['pendingTables', 'truncatingTable', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TRUNCATE_TABLE_SUCCESS:
    case constants.ActionTypes.STORAGE_TRUNCATE_TABLE_ERROR:
      _store = _store.deleteIn(['pendingTables', 'truncatingTable', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN:
      _store = _store.setIn(['pendingTables', 'addingColumn', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN_SUCCESS:
    case constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN_ERROR:
      _store = _store.deleteIn(['pendingTables', 'addingColumn', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN:
      _store = _store.setIn(['pendingTables', 'deletingColumn', action.tableId, action.columnName], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN_SUCCESS:
    case constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN_ERROR:
      _store = _store.deleteIn(['pendingTables', 'deletingColumn', action.tableId, action.columnName]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_DELETE_TABLE:
      _store = _store.setIn(['pendingTables', 'deleting'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_DELETE_TABLE_SUCCESS:
    case constants.ActionTypes.STORAGE_DELETE_TABLE_ERROR:
      _store = _store.deleteIn(['pendingTables', 'deleting']);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_SUCCESS:
    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_ERROR:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_SET_ALIAS_TABLE_FILTER:
      _store = _store.setIn(['pendingTables', 'settingAliasFilter', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_SET_ALIAS_TABLE_FILTER_SUCCESS:
    case constants.ActionTypes.STORAGE_SET_ALIAS_TABLE_FILTER_ERROR:
      _store = _store.setIn(['pendingTables', 'settingAliasFilter', action.tableId], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_REMOVE_ALIAS_TABLE_FILTER:
      _store = _store.setIn(['pendingTables', 'removingAliasFilter', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_REMOVE_ALIAS_TABLE_FILTER_SUCCESS:
    case constants.ActionTypes.STORAGE_REMOVE_ALIAS_TABLE_FILTER_ERROR:
      _store = _store.setIn(['pendingTables', 'removingAliasFilter', action.tableId], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY:
      _store = _store.setIn(['pendingTables', 'creatingPrimaryKey', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY_ERROR:
      _store = _store.deleteIn(['pendingTables', 'creatingPrimaryKey', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY:
      _store = _store.setIn(['pendingTables', 'deletingPrimaryKey', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY_ERROR:
      _store = _store.deleteIn(['pendingTables', 'deletingPrimaryKey', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT:
      _store = _store.setIn(['pendingTables', 'creatingSnapshot', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT_ERROR:
      _store = _store.deleteIn(['pendingTables', 'creatingSnapshot', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL:
      _store = _store.setIn(['pendingTables', 'restoring', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL_SUCCESS:
    case constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL_ERROR:
      _store = _store.deleteIn(['pendingTables', 'restoring', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT:
      _store = _store.setIn(['pendingTables', 'creatingFromSnapshot', action.snapshotId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT_ERROR:
      _store = _store.deleteIn(['pendingTables', 'creatingFromSnapshot', action.snapshotId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT:
      _store = _store.setIn(['pendingTables', 'deletingSnapshot', action.snapshotId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT_ERROR:
      _store = _store.deleteIn(['pendingTables', 'deletingSnapshot', action.snapshotId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_LOAD:
      _store = _store.setIn(['pendingTables', 'loading'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_LOAD_SUCCESS:
    case constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR:
      _store = _store.deleteIn(['pendingTables', 'loading']);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_EXPORT:
      _store = _store.setIn(['pendingTables', 'exporting', action.tableId], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_EXPORT_SUCCESS:
      _store = _store.deleteIn(['pendingTables', 'exporting', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_EXPORT_ERROR:
      _store = _store.deleteIn(['pendingTables', 'exporting', action.tableId]);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.ACTIVITY_MATCHING_DATA_LOADED:
      const usages = action.data.toMap().mapKeys((index, row) => row.get('inputTable'));
      _store = _store.set('tablesUsages', _store.get('tables').map((table) => {
        return parseInt(usages.getIn([table.get('id'), 'countRows'], 0));
      }));
      return StorageTablesStore.emitChange();
    
    case metadataConstants.ActionTypes.METADATA_SAVE_SUCCESS:
      if (action.objectType === 'table') {
        _store = _store.setIn(['tables', action.objectId, 'metadata'], fromJS(action.metadata));
        return StorageTablesStore.emitChange();
      }
      if (action.objectType === 'column') {
        const [ tableId, columnName ] = action.objectId.split(/\.(?=[^.]+$)/);
        _store = _store.updateIn(['tables', tableId, 'columnMetadata'], (metadata) => metadata.toMap());
        _store = _store.setIn(['tables', tableId, 'columnMetadata', columnName], fromJS(action.metadata));
        return StorageTablesStore.emitChange();
      }
      break;
    
    case metadataConstants.ActionTypes.METADATA_DELETE_SUCCESS:
      if (action.objectType === 'column') {
        const [ tableId, columnName ] = action.objectId.split(/\.(?=[^.]+$)/);
        const index = _store.getIn(['tables', tableId, 'columnMetadata', columnName]).findIndex((metadata) => {
          return metadata.get('id') === action.metadataId;
        });
        _store = _store.deleteIn(['tables', tableId, 'columnMetadata', columnName, index]);
        return StorageTablesStore.emitChange();
      }
      break;

    default:
  }
});

export default StorageTablesStore;
