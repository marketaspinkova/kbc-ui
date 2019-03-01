import Dispatcher from '../../Dispatcher';
import Constants from './ConfigurationsConstants';
import RowConstants from './ConfigurationRowsConstants';
import Immutable from 'immutable';
import {Map} from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import * as InstalledComponentsConstants from '../components/Constants';
import isParsableConfiguration from './utils/isParsableConfiguration';

var _store = Map({
  configurations: Map(),
  pendingActions: Map(),
  editing: Map(),
  jsonEditor: Map()
});

let ConfigurationsStore = StoreUtils.createStore({
  get: function(componentId, configurationId) {
    return _store.getIn(['configurations', componentId, configurationId], Map());
  },

  getConfiguration: function(componentId, configurationId) {
    return _store.getIn(['configurations', componentId, configurationId, 'configuration'], Map());
  },

  getConfigurationContext: function(componentId, configurationId) {
    const rawConfig = _store.getIn(['configurations', componentId, configurationId], Map());
    const rows = rawConfig.get('rows', Map()).map((row) => row.get('configuration'));
    const configuration = rawConfig.get('configuration');
    return Immutable.fromJS({
      componentId,
      configurationId,
      configuration,
      rows
    });
  },

  isEditingJsonConfigurationValid: function(componentId, configId) {
    var value;
    value = this.getEditingJsonConfigurationString(componentId, configId);
    try {
      JSON.parse(value);
      return true;
    } catch (exception) {
      return false;
    }
  },

  getEditingJsonConfigurationString: function(componentId, configId) {
    const storedConfiguration = this.getConfiguration(componentId, configId);
    return _store.getIn(
      ['editing', componentId, configId, 'json'],
      JSON.stringify(storedConfiguration.toJS(), null, '  ')
    );
  },

  getEditingJsonConfiguration: function(componentId, configId) {
    if (!this.isEditingJsonConfigurationValid(componentId, configId)) {
      return null;
    }
    return JSON.parse(this.getEditingJsonConfigurationString(componentId, configId));
  },

  isEditingJsonConfiguration: function(componentId, configId) {
    return _store.hasIn(['editing', componentId, configId, 'json']);
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
  },

  hasJsonEditor: function(componentId, configId, parseFn, createFn, conformFn) {
    // FIXME?
    // force set opened JSON editor, if the configuration does not parse back to its original state
    // can this be done better? eg. calculate this property when storing the config in store in the first place?
    // this would require INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS, INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS
    // events access the parseFn and createFn, probably from the RoutesStore?
    const conformedConfig = conformFn(this.getConfiguration(componentId, configId));
    if (!isParsableConfiguration(conformedConfig, parseFn, createFn)) {
      _store = _store.setIn(['jsonEditor', componentId, configId], true);
    }
    return _store.hasIn(['jsonEditor', componentId, configId]);
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

    case InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS:
      _store = _store.setIn(['configurations', action.componentId, action.configId], Immutable.fromJS(action.data));
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

    case RowConstants.ActionTypes.CONFIGURATION_ROWS_SAVE_CONFIGURATION_SUCCESS:
      const {componentId, configurationId, rowId, row} = action;
      const configRowsPath = ['configurations', componentId, configurationId, 'rows'];
      const index = _store.getIn(configRowsPath).findIndex(configRow => configRow.get('id') === rowId);
      _store = _store.setIn(configRowsPath.concat(index), Immutable.fromJS(row));
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

    case Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, 'order-rows', action.rowId], true);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, 'order-rows']);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, 'order-rows'])
        .deleteIn(['editing', action.componentId, action.configurationId])
        .setIn(['configurations', action.componentId, action.configurationId], Immutable.fromJS(action.response));
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_UPDATE_JSON_CONFIGURATION:
      _store = _store.setIn(
        ['editing', action.componentId, action.configurationId, 'json'],
        action.value
      );
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_RESET_JSON_CONFIGURATION:
      _store = _store.deleteIn(
        ['editing', action.componentId, action.configurationId, 'json']
      );
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, 'save-json'], true);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, 'save-json']);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, 'save-json'])
        .deleteIn(['editing', action.componentId, action.configurationId, 'json'])
        .setIn(['configurations', action.componentId, action.configurationId, 'configuration'], action.value);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_JSON_EDITOR_OPEN:
      _store = _store
        .setIn(['jsonEditor', action.componentId, action.configurationId], true);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_JSON_EDITOR_CLOSE:
      _store = _store
        .deleteIn(['jsonEditor', action.componentId, action.configurationId]);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, 'reset-oauth', action.rowId], true);
      return ConfigurationsStore.emitChange();

    case Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_ERROR:
    case Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_SUCCESS:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, 'reset-oauth']);
      return ConfigurationsStore.emitChange();

    default:
      break;
  }
});

export default ConfigurationsStore;
