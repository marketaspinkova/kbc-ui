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

  getIsCreatingAliasTable() {
    return _store.getIn(['pendingTables', 'creatingAlias'], false);
  },

  getIsLoadingTable() {
    return _store.getIn(['pendingTables', 'loading'], false);
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

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], true);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_SUCCESS:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], false);
      return StorageTablesStore.emitChange();

    case constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_ERROR:
      _store = _store.setIn(['pendingTables', 'creatingAlias'], false);
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
