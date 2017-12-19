import Dispatcher from '../../../Dispatcher';
import Constants from '../ConfigurationsConstants';
import Immutable from 'immutable';
import {Map} from 'immutable';
import StoreUtils from '../../../utils/StoreUtils';
import InstalledComponentsConstants from '../Constants';

var _store = Map({
  configurations: Map(),
  pendingActions: Map(),
  editing: Map()
});

let ConfigurationsStore = StoreUtils.createStore({
  get: function(componentId, configurationId) {
    return _store.getIn(['configurations', componentId, configurationId], Map());
  },

  getConfiguration: function(componentId, configurationId) {
    return _store.getIn(['configurations', componentId, configurationId, 'configuration'], Map());
  },

  getPendingActions: function(componentId, configurationId) {
    return _store.getIn(['pendingActions', componentId, configurationId], Map());
  },

  getEditingConfiguration: function(componentId, configurationId, parseFn) {
    const storedConfiguration = parseFn(this.getConfiguration(componentId, configurationId));
    return _store.getIn(
      ['editing', componentId, configurationId, 'configuration'],
      storedConfiguration
    );
  },

  isEditingConfiguration: function(componentId, configurationId) {
    return _store.hasIn(['editing', componentId, configurationId, 'configuration']);
  }
});

Dispatcher.register(function(payload) {
  const action = payload.action;
  switch (action.type) {
    case InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        let retVal = store;
        retVal = retVal.deleteIn(['configurations', action.componentId]);
        action.configData.forEach(function(config) {
          retVal = retVal.setIn(['configurations', action.componentId, config.id], Immutable.fromJS(config));
        });
        return retVal;
      });
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_UPDATE_CONFIGURATION:
      _store = _store.setIn(
        ['editing', action.componentId, action.configurationId, 'configuration'],
        action.value
      );
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_RESET_CONFIGURATION:
      _store = _store.deleteIn(
        ['editing', action.componentId, action.configurationId, 'configuration']
      );
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, 'save-configuration'], true);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, 'save-configuration']);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, 'save-configuration'])
        .deleteIn(['editing', action.componentId, action.configurationId])
        .setIn(['configurations', action.componentId, action.configurationId], Immutable.fromJS(action.configuration));
      return ConfigurationsStore.emitChange();

    default:
      break;
  }
});

module.exports = ConfigurationsStore;
