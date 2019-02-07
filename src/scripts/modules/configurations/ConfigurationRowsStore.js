import Dispatcher from '../../Dispatcher';
import constants from './ConfigurationRowsConstants';
import Immutable from 'immutable';
import {Map} from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import fromJSOrdered from '../../utils/fromJSOrdered';
import * as InstalledComponentsConstants from '../components/Constants';
import ConfigurationsConstants from './ConfigurationsConstants';
import isParsableConfiguration from './utils/isParsableConfiguration';

var _store = Map({
  rows: Map(),
  pendingActions: Map(),
  editing: Map(),
  creating: Map(),
  jsonEditor: Map()
});

let ConfigurationRowsStore = StoreUtils.createStore({
  get: function(componentId, configId, rowId) {
    return _store.getIn(['rows', componentId, configId, rowId], Map());
  },

  getConfiguration: function(componentId, configId, rowId) {
    return _store.getIn(['rows', componentId, configId, rowId, 'configuration'], Map());
  },

  getRows: function(componentId, configId) {
    return _store.getIn(['rows', componentId, configId], Map());
  },

  isEditingJsonConfigurationValid: function(componentId, configId, rowId) {
    var value;
    value = this.getEditingJsonConfigurationString(componentId, configId, rowId);
    try {
      JSON.parse(value);
      return true;
    } catch (exception) {
      return false;
    }
  },

  getEditingJsonConfigurationString: function(componentId, configId, rowId) {
    const storedConfiguration = this.getConfiguration(componentId, configId, rowId);
    return _store.getIn(
      ['editing', componentId, configId, rowId, 'json'],
      JSON.stringify(storedConfiguration.toJS(), null, '  ')
    );
  },

  getEditingJsonConfiguration: function(componentId, configId, rowId) {
    if (!this.isEditingJsonConfigurationValid(componentId, configId, rowId)) {
      return null;
    }
    return JSON.parse(this.getEditingJsonConfigurationString(componentId, configId, rowId));
  },

  isEditingJsonConfiguration: function(componentId, configId, rowId) {
    return _store.hasIn(['editing', componentId, configId, rowId, 'json']);
  },

  getPendingActions: function(componentId, configId, rowId) {
    return _store.getIn(['pendingActions', componentId, configId, rowId], Map());
  },

  getEditingConfiguration: function(componentId, configId, rowId, parseFn) {
    const storedConfiguration = parseFn(this.getConfiguration(componentId, configId, rowId));
    return _store.getIn(
      ['editing', componentId, configId, rowId, 'configuration'],
      storedConfiguration
    );
  },

  isEditingConfiguration: function(componentId, configId, rowId) {
    return _store.hasIn(['editing', componentId, configId, rowId, 'configuration']);
  },

  hasJsonEditor: function(componentId, configId, rowId, parseFn, createFn, conformFn) {
    // FIXME?
    // force set opened JSON editor, if the configuration does not parse back to its original state
    // can this be done better? eg. calculate this property when storing the config in store in the first place?
    // this would require INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS, INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS
    // events access the parseFn and createFn, probably from the RoutesStore?
    const conformedConfig = conformFn(this.getConfiguration(componentId, configId, rowId));
    if (!isParsableConfiguration(conformedConfig, parseFn, createFn)) {
      _store = _store.setIn(['jsonEditor', componentId, configId, rowId], true);
    }
    return _store.hasIn(['jsonEditor', componentId, configId, rowId]);
  }
});

Dispatcher.register(function(payload) {
  const action = payload.action;
  switch (action.type) {
    case InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        let retVal = store;
        retVal = retVal.deleteIn(['rows', action.componentId, action.configId]);
        let orderedRows = Immutable.OrderedMap();
        action.data.rows.forEach(function(row) {
          orderedRows = orderedRows.set(row.id, Immutable.fromJS(row));
        });
        retVal = retVal.setIn(['rows', action.componentId, action.configId], orderedRows);
        return retVal;
      });
      return ConfigurationRowsStore.emitChange();

    case InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS:
      _store = _store.withMutations(function(store) {
        let retVal = store;
        action.configData.forEach(function(config) {
          retVal = retVal.deleteIn(['rows', action.componentId]);
          let orderedRows = Immutable.OrderedMap();
          config.rows.forEach(function(row) {
            orderedRows = orderedRows.set(row.id, Immutable.fromJS(row));
          });
          retVal = retVal.setIn(['rows', action.componentId, config.id], orderedRows);
        });
        return retVal;
      });
      return ConfigurationRowsStore.emitChange();


    case constants.ActionTypes.CONFIGURATION_ROWS_CREATE_START:
      _store = _store.setIn(['creating', action.componentId, action.configurationId], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_CREATE_ERROR:
      _store = _store.deleteIn(['creating', action.componentId, action.configurationId]);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_CREATE_SUCCESS:
      _store = _store
        .setIn(
          ['rows', action.componentId, action.configurationId, action.data.id],
          fromJSOrdered(action.data)
        );
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DELETE_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'delete'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DELETE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'delete']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DELETE_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'delete'])
        .deleteIn(['rows', action.componentId, action.configurationId, action.rowId]);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_ENABLE_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'enable'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_ENABLE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'enable']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_ENABLE_SUCCESS:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'enable'])
        .setIn(['rows', action.componentId, action.configurationId, action.rowId, 'isDisabled'], false);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DISABLE_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'disable'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DISABLE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'disable']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_DISABLE_SUCCESS:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'disable'])
        .setIn(['rows', action.componentId, action.configurationId, action.rowId, 'isDisabled'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_UPDATE_JSON_CONFIGURATION:
      _store = _store.setIn(
        ['editing', action.componentId, action.configurationId, action.rowId, 'json'],
        action.value
      );
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_RESET_JSON_CONFIGURATION:
      _store = _store.deleteIn(
        ['editing', action.componentId, action.configurationId, action.rowId, 'json']
      );
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_JSON_CONFIGURATION_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-json'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_JSON_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-json']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_JSON_CONFIGURATION_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-json'])
        .deleteIn(['editing', action.componentId, action.configurationId, action.rowId, 'json'])
        .setIn(['rows', action.componentId, action.configurationId, action.rowId, 'configuration'], action.value);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_UPDATE_CONFIGURATION:
      _store = _store.setIn(
        ['editing', action.componentId, action.configurationId, action.rowId, 'configuration'],
        action.value
      );
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_RESET_CONFIGURATION:
      _store = _store.deleteIn(
        ['editing', action.componentId, action.configurationId, action.rowId, 'configuration']
      );
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_CONFIGURATION_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-configuration'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-configuration']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_SAVE_CONFIGURATION_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'save-configuration'])
        .deleteIn(['editing', action.componentId, action.configurationId, action.rowId])
        .setIn(['rows', action.componentId, action.configurationId, action.rowId], Immutable.fromJS(action.row));
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_JSON_EDITOR_OPEN:
      _store = _store
        .setIn(['jsonEditor', action.componentId, action.configurationId, action.rowId], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_JSON_EDITOR_CLOSE:
      _store = _store
        .deleteIn(['jsonEditor', action.componentId, action.configurationId, action.rowId]);
      return ConfigurationRowsStore.emitChange();

    case ConfigurationsConstants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_START:
      _store = _store.withMutations(function(store) {
        let retVal = store;
        const rows = store.getIn(['rows', action.componentId, action.configurationId]);
        let orderedRows = Immutable.OrderedMap();
        retVal = retVal.deleteIn(['rows', action.componentId, action.configurationId]);
        action.rowIds.forEach(function(rowId) {
          orderedRows = orderedRows.set(rowId, rows.find(function(row) {
            return row.get('id') === rowId;
          }));
        });
        retVal = retVal.setIn(['rows', action.componentId, action.configurationId], orderedRows);
        return retVal;
      });
      return ConfigurationRowsStore.emitChange();

    case ConfigurationsConstants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_SUCCESS:
      _store = _store.withMutations(function(store) {
        let retVal = store;
        retVal = retVal.deleteIn(['rows', action.componentId, action.configurationId]);
        let orderedRows = Immutable.OrderedMap();
        action.response.rows.forEach(function(row) {
          orderedRows = orderedRows.set(row.id, Immutable.fromJS(row));
        });
        retVal = retVal.setIn(['rows', action.componentId, action.configurationId], orderedRows);
        return retVal;
      });
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_CLEAR_STATE_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'clear-state'], true);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_CLEAR_STATE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'clear-state']);
      return ConfigurationRowsStore.emitChange();

    case constants.ActionTypes.CONFIGURATION_ROWS_CLEAR_STATE_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, action.rowId, 'clear-state'])
        .setIn(['rows', action.componentId, action.configurationId, action.rowId], Immutable.fromJS(action.row));
      return ConfigurationRowsStore.emitChange();

    default:
      break;
  }
});

export default ConfigurationRowsStore;
