import Dispatcher from '../../../Dispatcher';
import { ActionTypes } from '../Constants';
const constants = { ActionTypes };
import Immutable from 'immutable';
const { Map } = Immutable;
import StoreUtils from '../../../utils/StoreUtils';
import _ from 'underscore';

let _store = Map({
  tables: Map(),
  isLoaded: false,
  isLoading: false,
  pendingTables: Map() // (creating/loading)
});

const StorageTablesStore = StoreUtils.createStore({
  getAll() {
    return _store.get('tables');
  },

  hasTable(tableId) {
    return _store.get('tables').has(tableId);
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

  getAddingColumn() {
    return _store.getIn(['pendingTables', 'addingColumn'], Map());
  },

  getDeletingColumn() {
    return _store.getIn(['pendingTables', 'deletingColumn'], Map());
  },

  getIsCreatingAliasTable() {
    return _store.getIn(['pendingTables', 'creatingAlias'], false);
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
    case constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store.setIn(['tables'], Map());
        _.each(action.tables, function(table) {
          const tObj = Immutable.fromJS(table);
          storeResult = storeResult.setIn(['tables', tObj.get('id')], tObj);
        });
        return storeResult.set('isLoading', false).set('isLoaded', true);
      });
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLES_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE:
      _store = _store.setIn(['pendingTables', 'creating'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_SUCCESS:
      _store = _store.setIn(['pendingTables', 'creating'], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR:
      _store = _store.setIn(['pendingTables', 'creating'], false);
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

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_SUCCESS:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_ERROR:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], false);
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

    case constants.ActionTypes.STORAGE_TABLES_LOAD:
      _store = _store.set('isLoading', true);
      _store = _store.setIn(['pendingTables', 'loading'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_LOAD_SUCCESS:
      _store = _store.setIn(['pendingTables', 'loading'], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR:
      _store = _store.setIn(['pendingTables', 'loading'], false);
      return StorageTablesStore.emitChange();
    default:
  }
});

export default StorageTablesStore;
