import StoreUtils from '../../../utils/StoreUtils';
import Immutable from 'immutable';
import dispatcher from '../../../Dispatcher';
import Constants from '../VersionsConstants';

var Map = Immutable.Map, List = Immutable.List;

var _store = Map({
  loadingVersions: Map(),
  versions: Map(),
  versionsConfigs: Map(),
  newVersionNames: Map(),
  searchFilters: Map(),
  pending: Map(),
  reloading: Map(),
  multiLoadPending: Map()
});

var VersionsStore = StoreUtils.createStore({
  hasVersions: function(componentId, configId) {
    return _store.hasIn(['versions', componentId, configId]);
  },

  hasVersion: function(componentId, configId, versionId) {
    return _store.hasIn(['versions', componentId, configId, versionId]);
  },

  hasConfigByVersion: function(componentId, configId, versionId) {
    return _store.hasIn(['versionsConfigs', componentId, configId, versionId]);
  },

  isLoadingVersions: function(componentId, configId) {
    return _store.getIn(['loadingVersions', componentId, configId], false);
  },

  getVersions: function(componentId, configId) {
    return _store.getIn(['versions', componentId, configId], List());
  },

  getVersionsConfigs: function(componentId, configId) {
    return _store.getIn(['versionsConfigs', componentId, configId], List());
  },

  getConfigByVersion: function(componentId, configId, versionId) {
    return _store.getIn(['versionsConfigs', componentId, configId, versionId], Map());
  },

  getVersion: function(componentId, configId, versionId) {
    return _store.getIn(['versions', componentId, configId, versionId], Map());
  },

  getNewVersionNames: function(componentId, configId) {
    return _store.getIn(['newVersionNames', componentId, configId], Map());
  },

  getNewVersionName: function(componentId, configId, version) {
    return _store.getIn(['newVersionNames', componentId, configId, version]);
  },

  getSearchFilter: function(componentId, configId) {
    return _store.getIn(['searchFilters', componentId, configId], '');
  },

  isPendingConfig: function(componentId, configId) {
    return _store.hasIn(['pending', componentId, configId], false);
  },

  isReloadingConfig: function(componentId, configId) {
    return _store.hasIn(['reloading', componentId, configId], false);
  },

  getPendingVersions: function(componentId, configId) {
    return _store.getIn(['pending', componentId, configId], Map());
  },

  getPendingMultiLoad(componentId, configId) {
    return _store.getIn(['multiLoadPending', componentId, configId], Map());
  }

});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {
    case Constants.ActionTypes.VERSIONS_LOAD_START:
      _store = _store.setIn(['loadingVersions', action.componentId, action.configId], true);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_LOAD_SUCCESS:
      _store = _store.setIn(['versions', action.componentId, action.configId], Immutable.fromJS(action.versions));
      _store = _store.setIn(['rollbackVersions', action.componentId, action.configId], false);
      _store = _store.setIn(['loadingVersions', action.componentId, action.configId], false);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_LOAD_ERROR:
      _store = _store.setIn(['loadingVersions', action.componentId, action.configId], false);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_CONFIG_LOAD_START:
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.version], true);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_CONFIG_LOAD_SUCCESS:
      _store = _store.setIn(['versionsConfigs', action.componentId, action.configId, action.version], Immutable.fromJS(action.data));
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.version], false);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_CONFIG_LOAD_ERROR:
      _store = _store.setIn(['loadingVersionConfig', action.componentId, action.configId, action.version], false);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_ROLLBACK_START:
    case Constants.ActionTypes.VERSIONS_ROLLBACK_SUCCESS:
    case Constants.ActionTypes.VERSIONS_ROLLBACK_ERROR:
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_NEW_NAME_CHANGE:
      _store = _store.setIn(['newVersionNames', action.componentId, action.configId, action.version], action.name);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_FILTER_CHANGE:
      _store = _store.setIn(['searchFilters', action.componentId, action.configId], action.query);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_PENDING_START:
      _store = _store.setIn(['pending', action.componentId, action.configId, action.version, action.action], true);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_PENDING_STOP:
      _store = _store.deleteIn(['pending', action.componentId, action.configId]);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_MULTI_PENDING_START:
      _store = _store.setIn(['multiLoadPending', action.componentId, action.configId, action.pivotVersion], true);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_MULTI_PENDING_STOP:
      _store = _store.deleteIn(['multiLoadPending', action.componentId, action.configId, action.pivotVersion]);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_RELOAD_START:
      _store = _store.setIn(['reloading', action.componentId, action.configId], true);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_RELOAD_SUCCESS:
      _store = _store.setIn(['versions', action.componentId, action.configId], Immutable.fromJS(action.versions));
      _store = _store.deleteIn(['reloading', action.componentId, action.configId]);
      return VersionsStore.emitChange();

    case Constants.ActionTypes.VERSIONS_RELOAD_ERROR:
      _store = _store.deleteIn(['reloading', action.componentId, action.configId]);
      return VersionsStore.emitChange();

    default:
  }
});

export default VersionsStore;
