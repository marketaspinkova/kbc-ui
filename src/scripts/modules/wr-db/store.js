import Dispatcher from '../../Dispatcher';
import { Map, fromJS } from 'immutable';
import _ from 'underscore';
import StoreUtils from '../../utils/StoreUtils';
import versionsConstants from '../components/VersionsConstants';
import constants from './constants';

let _store = Map({
  credentials: Map(), // componentId#configId
  tables: Map(), // componentId#configId
  tablesConfig: Map(), // componentId#configId#tableId
  updatingTables: Map(), // componentId#configId#tableId
  editing: Map(), // componentId#configId whatever
  updatingColumns: Map(), // componentId#configId#tableId
  savingCredentials: Map(), // componentId#configId
  provisioningCredentials: Map(), // componentId#configId
  loadingProvCredentials: Map(), // componentId#configId
  deletingTables: Map()
}); // componentId#configId

const WrDbStore = StoreUtils.createStore({
  getDeletingTables(componentId, configId) {
    return _store.getIn(['deletingTables', componentId, configId], Map());
  },

  isLoadingProvCredentials(componentId, configId) {
    return _store.hasIn(['loadingProvCredentials', componentId, configId]);
  },

  getProvisioningCredentials(componentId, configId) {
    return _store.getIn(['provisioningCredentials', componentId, configId]);
  },

  hasConfiguration(componentId, configId) {
    return this.hasTables(componentId, configId);
  },

  getSavingCredentials(componentId, configId) {
    return _store.getIn(['savingCredentials', componentId, configId]);
  },

  hasTables(componentId, configId) {
    return _store.hasIn(['tables', componentId, configId]);
  },

  getTables(componentId, configId) {
    return _store.getIn(['tables', componentId, configId]);
  },

  hasCredentials(componentId, configId) {
    return _store.hasIn(['credentials', componentId, configId]);
  },

  getCredentials(componentId, configId) {
    let creds = _store.getIn(['credentials', componentId, configId]);
    if (_.isEmpty(creds ? creds.toJS() : {})) {
      creds = Map();
    }
    return creds;
  },

  isUpdatingTable(componentId, configId, tableId) {
    return _store.hasIn(['updatingTables', componentId, configId, tableId]);
  },

  getUpdatingTables(componentId, configId) {
    return _store.getIn(['updatingTables', componentId, configId], Map());
  },

  hasTableConfig(componentId, configId, tableId) {
    return _store.hasIn(['tablesConfig', componentId, configId, tableId]);
  },

  getTableConfig(componentId, configId, tableId) {
    return _store.getIn(['tablesConfig', componentId, configId, tableId]);
  },

  getEditingByPath(componentId, configId, path) {
    const editPath = ['editing', componentId, configId].concat(path);
    return _store.getIn(editPath);
  },

  getEditing(componentId, configId) {
    return _store.getIn(['editing', componentId, configId], Map());
  },

  getUpdatingColumns(componentId, configId, tableId) {
    return _store.getIn(['updatingColumns', componentId, configId, tableId]);
  }
});

Dispatcher.register(payload => {
  const { action } = payload;
  let tables = null;
  let table = null;

  switch (action.type) {
    case constants.ActionTypes.WR_DB_LOAD_PROVISIONING_START:
      _store = _store.setIn(['loadingProvCredentials', action.componentId, action.configId], true);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_LOAD_PROVISIONING_SUCCESS:
      _store = _store.deleteIn(['loadingProvCredentials', action.componentId, action.configId]);
      _store = _store.setIn(
        ['provisioningCredentials', action.componentId, action.configId],
        fromJS(action.credentials)
      );
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_START:
      _store = _store.setIn(['savingCredentials', action.componentId, action.configId], action.credentials);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_SUCCESS:
      _store = _store.deleteIn(['savingCredentials', action.componentId, action.configId]);
      _store = _store.setIn(['credentials', action.componentId, action.configId], fromJS(action.credentials));
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_ADD_TABLE_START:
      _store = _store.setIn(['updatingTables', action.componentId, action.configId, action.tableId], true);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_ADD_TABLE_SUCCESS:
      _store = _store.deleteIn(['updatingTables', action.componentId, action.configId, action.tableId]);
      tables = WrDbStore.getTables(action.componentId, action.configId);
      tables = tables.push(fromJS(action.table));
      _store = _store.setIn(['tables', action.componentId, action.configId], tables);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SAVE_COLUMNS_START:
      _store = _store.setIn(['updatingColumns', action.componentId, action.configId, action.tableId], action.columns);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SAVE_COLUMNS_SUCCESS:
      _store = _store.deleteIn(['updatingColumns', action.componentId, action.configId, action.tableId]);
      _store = _store.setIn(
        ['tablesConfig', action.componentId, action.configId, action.tableId, 'columns'],
        action.columns
      );
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SET_EDITING:
      _store = _store.setIn(['editing', action.componentId, action.configId].concat(action.path), action.data);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_GET_TABLE_SUCCESS:
      _store = _store.setIn(
        ['tablesConfig', action.componentId, action.configId, action.tableId],
        fromJS(action.tableConfig)
      );
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SET_TABLE_START:
      _store = _store.setIn(['updatingTables', action.componentId, action.configId, action.tableId], true);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_SET_TABLE_SUCCESS:
      _store = _store.deleteIn(['updatingTables', action.componentId, action.configId, action.tableId]);

      tables = WrDbStore.getTables(action.componentId, action.configId);
      table = tables.find(t => t.get('id') === action.tableId);
      if (!table) {
        table = fromJS({
          id: action.tableId,
          name: action.dbName,
          export: action.isExported
        });
      } else {
        table = table.set('name', action.dbName);
        table = table.set('export', action.isExported);
      }
      tables = tables.map(t => (t.get('id') === action.tableId ? table : t));
      _store = _store.setIn(['tables', action.componentId, action.configId], tables);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_GET_CONFIGURATION_SUCCESS:
      _store = _store.setIn(['tables', action.componentId, action.configId], fromJS(action.config.tables));
      _store = _store.setIn(['credentials', action.componentId, action.configId], fromJS(action.config.credentials));
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_DELETE_TABLE_START:
      _store = _store.setIn(['deletingTables', action.componentId, action.configId, action.tableId], true);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_DELETE_TABLE_SUCCESS:
      _store = _store.deleteIn(['deletingTables', action.componentId, action.configId, action.tableId]);
      tables = WrDbStore.getTables(action.componentId, action.configId);
      tables = tables.filter(t => t.get('id') !== action.tableId);
      _store = _store.setIn(['tables', action.componentId, action.configId], tables);
      return WrDbStore.emitChange();

    case constants.ActionTypes.WR_DB_API_ERROR:
      if (action.errorPath) {
        _store = _store.deleteIn(action.errorPath);
      }
      return WrDbStore.emitChange();

    case versionsConstants.ActionTypes.VERSIONS_ROLLBACK_SUCCESS:
      _store = _store.deleteIn(['tables', action.componentId, action.configId]);
      _store = _store.deleteIn(['tablesConfig', action.componentId, action.configId]);
      return WrDbStore.emitChange();

    default:
  }
});

export default WrDbStore;
