import StoreUtils, { initStore } from '../../utils/StoreUtils';
import {Map} from 'immutable';
import dispatcher from '../../Dispatcher';
import Constants from './MigrationsConstants';

var _store = initStore('MigrationsStore', Map({
  pendingLegacyUIMigrations: Map()
}));

var MigrationsStore = StoreUtils.createStore({
  isPendingLegacyUIMigration: function(componentId, configId) {
    return _store.hasIn(['pendingLegacyUIMigrations', componentId, configId]);
  }
});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {
    case Constants.ActionTypes.LEGACY_UI_MIGRATION_START:
      _store = _store.setIn(['pendingLegacyUIMigrations', action.componentId, action.configurationId], true);
      return MigrationsStore.emitChange();

    case Constants.ActionTypes.LEGACY_UI_MIGRATION_SUCCESS:
    case Constants.ActionTypes.LEGACY_UI_MIGRATION_ERROR:
      _store = _store.deleteIn(['pendingLegacyUIMigrations', action.componentId, action.configurationId]);
      return MigrationsStore.emitChange();
    default:
  }
});

export default MigrationsStore;
