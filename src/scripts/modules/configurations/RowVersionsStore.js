import Immutable from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as TransformationsConstants from '../transformations/Constants'
import ConfigurationRowsConstants from './ConfigurationRowsConstants';
import Constants from './RowVersionsConstants';

var Map = Immutable.Map, List = Immutable.List;

var _store = Map({
  loadingVersions: Map(),
  versions: Map(),
  versionsConfigs: Map(),
  newVersionNames: Map(),
  searchFilters: Map(),
  pending: Map(),
  multiLoadPending: Map()
});

var RowVersionsStore = StoreUtils.createStore({
  hasVersions: function(componentId, configId, rowId) {
    return _store.hasIn(['versions', componentId, configId, rowId]);
  },

  hasConfigByVersion: function(componentId, configId, rowId, versionId) {
    return _store.hasIn(['versionsConfigs', componentId, configId, rowId, versionId]);
  },

  getVersions: function(componentId, configId, rowId) {
    return _store.getIn(['versions', componentId, configId, rowId], List());
  },

  getVersionsConfigs: function(componentId, configId, rowId) {
    return _store.getIn(['versionsConfigs', componentId, configId, rowId], List());
  },

  getConfigByVersion: function(componentId, configId, rowId, versionId) {
    return _store.getIn(['versionsConfigs', componentId, configId, rowId, versionId], Map());
  },

  getVersion: function(componentId, configId, rowId, versionId) {
    return _store.getIn(['versions', componentId, configId, rowId, versionId], Map());
  },

  getNewVersionNames: function(componentId, configId, rowId) {
    return _store.getIn(['newVersionNames', componentId, configId, rowId], Map());
  },

  getSearchFilter: function(componentId, configId, rowId) {
    return _store.getIn(['searchFilters', componentId, configId, rowId], '');
  },

  isPendingConfig: function(componentId, configId, rowId) {
    return _store.hasIn(['pending', componentId, configId, rowId], false);
  },

  getPendingVersions: function(componentId, configId, rowId) {
    return _store.getIn(['pending', componentId, configId, rowId], Map());
  },

  getPendingMultiLoad(componentId, configId, rowId) {
    return _store.getIn(['multiLoadPending', componentId, configId, rowId], Map());
  }

});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {
    case Constants.ActionTypes.ROW_VERSIONS_LOAD_START:
      _store = _store.setIn(['loadingVersions', action.componentId, action.configId, action.rowId], true);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_LOAD_SUCCESS:
      _store = _store.setIn(['versions', action.componentId, action.configId, action.rowId], Immutable.fromJS(action.versions));
      _store = _store.setIn(['rollbackVersions', action.componentId, action.configId, action.rowId], false);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_LOAD_ERROR:
      _store = _store.setIn(['loadingVersions', action.componentId, action.configId, action.rowId], false);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_START:
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.rowId, action.version], true);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_SUCCESS:
      _store = _store.setIn(['versionsConfigs', action.componentId, action.configId, action.rowId, action.version], Immutable.fromJS(action.data));
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.rowId, action.version], false);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_ERROR:
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.rowId, action.version], false);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_START:
    case Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_SUCCESS:
    case Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_ERROR:
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_NEW_NAME_CHANGE:
      _store = _store.setIn(['newVersionNames', action.componentId, action.configId, action.rowId, action.version], action.name);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_FILTER_CHANGE:
      _store = _store.setIn(['searchFilters', action.componentId, action.configId, action.rowId], action.query);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_PENDING_START:
      _store = _store.setIn(['pending', action.componentId, action.configId, action.rowId, action.version, action.action], true);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_PENDING_STOP:
      _store = _store.deleteIn(['pending', action.componentId, action.configId, action.rowId]);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_MULTI_PENDING_START:
      _store = _store.setIn(['multiLoadPending', action.componentId, action.configId, action.rowId, action.pivotVersion], true);
      return RowVersionsStore.emitChange();

    case Constants.ActionTypes.ROW_VERSIONS_MULTI_PENDING_STOP:
      _store = _store.deleteIn(['multiLoadPending', action.componentId, action.configId, action.rowId, action.pivotVersion]);
      return RowVersionsStore.emitChange();

    case ConfigurationRowsConstants.ActionTypes.CONFIGURATION_ROWS_DELETE_SUCCESS:
      _store = _store.deleteIn(['versions', action.componentId, action.configurationId, action.rowId]);
      return RowVersionsStore.emitChange();

    case TransformationsConstants.ActionTypes.TRANSFORMATION_DELETE_SUCCESS:
      _store = _store.deleteIn(['versions', 'transformation', action.bucketId, action.transformationId]);
      return RowVersionsStore.emitChange();

    default:
  }
});

export default RowVersionsStore;
