import Dispatcher from '../../../Dispatcher';
import * as constants from '../Constants';
import { Map, fromJS } from 'immutable';
import TemplatesStore from './TemplatesStore';
import ComponentsStore from './ComponentsStore';
import StoreUtils from '../../../utils/StoreUtils';
import fromJSOrdered from '../../../utils/fromJSOrdered';
import matchByWords from '../../../utils/matchByWords';
import Immutable from 'immutable';

let _store = Map({
  configData: Map(), // componentId #configId
  configRowsData: Map(), // componentId #configId #rowId
  configRows: Map(), // componentId #configId #rowId
  configDataLoading: Map(), // componentId #configId - configuration detail JSON
  configsDataLoading: Map(), // componentId - configurations JSON
  configsDataLoaded: Map(), // componentId - configurations JSON
  configDataEditing: Map(), // componentId #configId - configuration
  configDataEditingObject: Map(), // componentId #configId - configuration
  configDataParametersEditing: Map(), // componentId #configId - configuration
  rawConfigDataEditing: Map(), // componentId #configId - configuration stringified JSON
  rawConfigDataParametersEditing: Map(), // componentId #configId - configuration stringified JSON
  templatedConfigEditing: Map(), // componentId #configId
  templatedConfigValuesEditingValues: Map(), // componentId #configId
  // group (params:Map|templates:Map)
  templatedConfigValuesEditingString: Map(), // componentId #configId
  templatedConfigEditingString: Map(), // componentId #configId

  // detail JSON
  configDataSaving: Map(),
  configDataParametersSaving: Map(),
  localState: Map(),

  components: Map(),
  deletedComponents: Map(),
  editingConfigurations: Map(),
  editingConfigurationRows: Map(),
  savingConfigurations: Map(),
  savingConfigurationRows: Map(),
  deletingConfigurations: Map(),
  restoringConfigurations: Map(),
  isLoaded: false,
  isLoading: false,
  isDeletedLoaded: false,
  isDeletedLoading: false,
  pendingActions: Map(),
  openMappings: Map(),

  filters: Map()
});

var InstalledComponentsStore = StoreUtils.createStore({
  getLocalState(componentId, configId) {
    return _store.getIn(['localState', componentId, configId], Map());
  },

  getAll() {
    return _store
      .get('components')
      .map(component =>
        component.set(
          'configurations',
          component.get('configurations').sortBy(configuration => configuration.get('name').toLowerCase())
        )
      )
      .sortBy(component => component.get('name'));
  },

  getAllDeleted() {
    return _store
      .get('deletedComponents')
      .map(component =>
        component.set(
          'configurations',
          component.get('configurations').sortBy(configuration => configuration.get('name').toLowerCase())
        )
      )
      .sortBy(component => component.get('name'));
  },

  getAllForType(type) {
    return this.getAll().filter(component => component.get('type') === type);
  },

  getFilteredComponents(type) {
    const filterQuery = this.getComponentFilter(type).toLowerCase();

    const filteredConfigurations = this.getAllForType(type)
      .map(component =>
        component.set(
          'configurations',
          component.get('configurations', Map()).filter(function(configuration) {
            return (
              matchByWords(configuration.get('name').toLowerCase(), filterQuery) ||
              matchByWords(configuration.get('description', '').toLowerCase(), filterQuery)
            );
          })
        )
      )
      .filter(component => component.get('configurations').count() > 0);

    const filteredComponents = this.getAllForType(type).filter(component =>
      matchByWords(component.get('name').toLowerCase(), filterQuery)
    );
    const filtered = filteredComponents.mergeDeep(filteredConfigurations);

    return filtered;
  },

  getComponentFilter(filterType) {
    return _store.getIn(['filters', 'installedComponents', filterType], '').trim();
  },

  getTrashFilter(filterType) {
    return _store.getIn(['filters', 'trash', filterType], '');
  },

  getAllDeletedFiltered() {
    const nameFilter = this.getTrashFilter('name').toLowerCase();
    const typeFilter = this.getTrashFilter('type');
    let components = this.getAllDeleted();

    if (typeFilter && typeFilter !== '') {
      components = components.filter(function(component) {
        if (typeFilter === 'orchestrator') {
          return component.get('id').toString() === typeFilter;
        } else {
          return component.get('type').toString() === typeFilter;
        }
      });
    }

    if (!nameFilter || nameFilter === '') {
      return components;
    } else {
      return components.filter(function(component) {
        return (
          matchByWords(component.get('name').toLowerCase(), nameFilter) ||
          matchByWords(component.get('id').toLowerCase(), nameFilter) ||
          this.getAllDeletedConfigurationsFiltered(component).count()
        );
      }, this);
    }
  },

  getAllDeletedConfigurationsFiltered(component) {
    const filter = this.getTrashFilter('name').toLowerCase();
    const configurations = component.get('configurations', Map());

    if (!filter || filter === '') {
      return configurations;
    } else {
      return configurations.filter(function(configuration) {
        return (
          matchByWords(configuration.get('name').toLowerCase(), filter) ||
          matchByWords(configuration.get('description', '').toLowerCase(), filter) ||
          matchByWords(configuration.get('id').toLowerCase(), filter)
        );
      }, this);
    }
  },

  getAllDeletedForType(type) {
    return this.getAllDeleted().filter(component => component.get('type') === type);
  },

  getConfigurationFilter(type) {
    return _store.getIn(['filters', 'installedComponents', type], '');
  },

  getComponentDetailFilter(componentId) {
    return _store.getIn(['filters', 'installedComponents', componentId], '');
  },

  getComponent(componentId) {
    return _store.getIn(['components', componentId]);
  },

  getIsConfigDataLoaded(componentId, configId) {
    return _store.hasIn(['configData', componentId, configId]);
  },

  getIsConfigsDataLoaded(componentId) {
    return _store.getIn(['configsDataLoaded', componentId], false);
  },

  getEditingConfigData(componentId, configId, defaultValue) {
    return _store.getIn(['configDataEditing', componentId, configId], defaultValue);
  },

  getEditingRawConfigData(componentId, configId) {
    const configData = InstalledComponentsStore.getConfigData(componentId, configId);
    const path = ['rawConfigDataEditing', componentId, configId];
    return _store.getIn(path, JSON.stringify(configData, null, ' '));
  },

  getEditingRawConfigDataParameters(componentId, configId) {
    const configData = InstalledComponentsStore.getConfigDataParameters(componentId, configId);
    const savedParams = JSON.stringify(configData.toJSON(), null, '  ');
    return _store.getIn(['rawConfigDataParametersEditing', componentId, configId], savedParams);
  },

  getSavingConfigData(componentId, configId) {
    return _store.getIn(['configDataSaving', componentId, configId]);
  },

  getSavingConfigDataParameters(componentId, configId) {
    return _store.getIn(['configDataParametersSaving', componentId, configId]);
  },

  getConfigData(componentId, configId) {
    return _store.getIn(['configData', componentId, configId], Map());
  },

  getEditingConfigDataObject(componentId, configId) {
    return _store.getIn(['configDataEditingObject', componentId, configId], Map());
  },

  getConfigDataParameters(componentId, configId) {
    return _store.getIn(['configData', componentId, configId, 'parameters'], Map());
  },

  getConfig(componentId, configId) {
    return _store.getIn(['components', componentId, 'configurations', configId], Map());
  },

  getDeletedConfig(componentId, configId) {
    return _store.getIn(['deletedComponents', componentId, 'configurations', configId]);
  },

  getConfigRows(componentId, configId) {
    return _store.getIn(['configRows', componentId, configId], Map());
  },

  getConfigRow(componentId, configId, rowId) {
    return _store.getIn(['configRows', componentId, configId, rowId], Map());
  },

  getConfigRowData(componentId, configId, rowId) {
    return _store.getIn(['configRowsData', componentId, configId, rowId], Map());
  },

  isEditingConfig(componentId, configId, field) {
    return _store.hasIn(['editingConfigurations', componentId, configId, field]);
  },

  isEditingConfigRow(componentId, configId, rowId, field) {
    return _store.hasIn(['editingConfigurationRows', componentId, configId, rowId, field]);
  },

  isEditingConfigData(componentId, configId) {
    return _store.hasIn(['editingConfigData', componentId, configId]);
  },

  isChangedRawConfigData(componentId, configId) {
    return _store.hasIn(['rawConfigDataEditing', componentId, configId]);
  },

  isChangedRawConfigDataParameters(componentId, configId) {
    return _store.hasIn(['rawConfigDataParametersEditing', componentId, configId]);
  },

  isEditingTemplatedConfig(componentId, configId) {
    return _store.getIn(['templatedConfigEditing', componentId, configId], false);
  },

  isChangedTemplatedConfig(componentId, configId) {
    const pathValues = [
      'templatedConfigValuesEditingValues',
      'templatedConfigValuesEditingString',
      'templatedConfigEditing'
    ];
    const isChanged = pathValues.reduce(
      (memo, path) => memo || _store.hasIn([path, componentId, configId], false),
      false
    );
    return isChanged;
  },

  getEditingConfig(componentId, configId, field) {
    return _store.getIn(['editingConfigurations', componentId, configId, field]);
  },

  getEditingConfigRow(componentId, configId, rowId, field) {
    return _store.getIn(['editingConfigurationRows', componentId, configId, rowId, field]);
  },

  isValidEditingConfig(componentId, configId, field) {
    const value = this.getEditingConfig(componentId, configId, field);

    switch (field) {
      case 'name':
        return !!(value && value.trim().length > 0);
      default:
        return true;
    }
  },

  isValidEditingConfigRow(componentId, configId, rowId, field) {
    const value = this.getEditingConfigRow(componentId, configId, rowId, field);

    switch (field) {
      case 'name':
        return !!(value && value.trim().length > 0);
      default:
        return true;
    }
  },

  isValidEditingConfigData(componentId, configId) {
    const value = this.getEditingRawConfigData(componentId, configId);
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  },

  isValidEditingConfigDataParameters(componentId, configId) {
    const value = this.getEditingRawConfigDataParameters(componentId, configId);
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  },

  getRestoringConfigurations() {
    return _store.get('restoringConfigurations');
  },

  getDeletingConfigurations() {
    return _store.get('deletingConfigurations');
  },

  isDeletingConfig(componentId, configId) {
    return _store.hasIn(['deletingConfigurations', componentId, configId]);
  },

  isSavingConfig(componentId, configId, field) {
    return _store.hasIn(['savingConfigurations', componentId, configId, field]);
  },

  isSavingConfigRow(componentId, configId, rowId, field) {
    return _store.hasIn(['savingConfigurationRows', componentId, configId, rowId, field]);
  },

  isSavingConfigData(componentId, configId) {
    return _store.hasIn(['configDataSaving', componentId, configId]);
  },

  isSavingConfigDataParameters(componentId, configId) {
    return _store.hasIn(['configDataParametersSaving', componentId, configId]);
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  getIsDeletedLoading() {
    return _store.get('isDeletedLoading');
  },

  getIsDeletedLoaded() {
    return _store.get('isDeletedLoaded');
  },

  getPendingActions(componentId, configId) {
    return _store.getIn(['pendingActions', componentId, configId], Map());
  },

  getOpenMappings(componentId, configId) {
    return _store.getIn(['openMappings', componentId, configId], Map());
  },

  // new
  getTemplatedConfigValueConfig(componentId, configId) {
    return _store.getIn(['configData', componentId, configId, 'parameters', 'config'], Map());
  },

  getTemplatedConfigValueUserParams(componentId, configId) {
    let config = _store.getIn(['configData', componentId, configId, 'parameters', 'config'], Map());
    // delete keys from template if template matches
    const template = TemplatesStore.getMatchingTemplate(componentId, config);
    if (!template.isEmpty()) {
      template
        .get('data')
        .keySeq()
        .forEach(key => (config = config.delete(key)));
    }
    return config;
  },

  getTemplatedConfigValueWithoutUserParams(componentId, configId) {
    let config = _store.getIn(['configData', componentId, configId, 'parameters', 'config'], Map());
    // delete schema keys from config
    ComponentsStore.getComponent(componentId)
      .get('configurationSchema', Map())
      .getIn(['properties'], Map())
      .keySeq()
      .forEach(key => (config = config.delete(key)));
    return config;
  },

  getTemplatedConfigEditingValueParams(componentId, configId) {
    const params = InstalledComponentsStore.getTemplatedConfigValueUserParams(componentId, configId);
    return _store.getIn(['templatedConfigValuesEditingValues', componentId, configId, 'params'], params);
  },

  getTemplatedConfigEditingValueTemplate(componentId, configId) {
    const config = InstalledComponentsStore.getTemplatedConfigValueConfig(componentId, configId);
    const matchingTemplate = TemplatesStore.getMatchingTemplate(componentId, config);
    return _store.getIn(['templatedConfigValuesEditingValues', componentId, configId, 'template'], matchingTemplate);
  },

  getTemplatedConfigEditingValueString(componentId, configId) {
    const config = InstalledComponentsStore.getTemplatedConfigValueConfig(componentId, configId);
    return _store.getIn(
      ['templatedConfigValuesEditingString', componentId, configId],
      JSON.stringify(config.toJS(), null, 2)
    );
  },

  isTemplatedConfigEditingString(componentId, configId) {
    return _store.getIn(['templatedConfigEditingString', componentId, configId]) || false;
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.INSTALLED_COMPONENTS_LOCAL_STATE_UPDATE:
      var { data } = action;
      var path = ['localState', action.componentId, action.configId];
      _store = _store.setIn(path, data);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_EDIT_UPDATE:
      path = ['configDataEditing', action.componentId, action.configId];
      var configData = action.data;
      _store = _store.setIn(path, configData);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_EDIT_CANCEL:
      path = ['configDataEditing', action.componentId, action.configId];
      _store = _store.deleteIn(path);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_UPDATE:
      path = ['rawConfigDataEditing', action.componentId, action.configId];
      configData = action.data;
      _store = _store.setIn(path, configData);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_CANCEL:
      path = ['rawConfigDataEditing', action.componentId, action.configId];
      _store = _store.deleteIn(path);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_UPDATE:
      path = ['rawConfigDataParametersEditing', action.componentId, action.configId];
      configData = action.data;
      _store = _store.setIn(path, configData);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_CANCEL:
      path = ['rawConfigDataParametersEditing', action.componentId, action.configId];
      _store = _store.deleteIn(path);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD:
      _store = _store.setIn(['configDataLoading', action.componentId, action.configId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS:
      _store = _store.withMutations((store) => {
        store.deleteIn(['configDataLoading', action.componentId, action.configId]);
        store.deleteIn(['configRowsData', action.componentId, action.configId]);
        store.deleteIn(['configRows', action.componentId, action.configId]);
        store.setIn(['configData', action.componentId, action.configId], fromJSOrdered(action.data.configuration));
        store.setIn(['components', action.componentId, 'configurations', action.configId], fromJSOrdered(action.data));
        action.data.rows.forEach(row => {
          store.setIn(['configRowsData', action.componentId, action.configId, row.id], fromJSOrdered(row.configuration));
          store.setIn(['configRows', action.componentId, action.configId, row.id], fromJS(row));
        });
      });
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_ERROR:
      _store = _store.deleteIn(['configDataLoading', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD:
      _store = _store.setIn(['configsDataLoading', action.componentId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS:
      _store = _store.withMutations((store) => {
        store.deleteIn(['configsDataLoading', action.componentId]);
        store.setIn(['configsDataLoaded', action.componentId], true);
        action.configData.forEach(configuration => {
          store.deleteIn(['configRowsData', action.componentId, configuration.id]);
          store.deleteIn(['configRows', action.componentId, configuration.id]);
          store.setIn(['components', action.componentId, 'configurations', configuration.id], fromJSOrdered(configuration));
          configuration.rows.forEach(row => {
            store.setIn(['configRowsData', action.componentId, configuration.id, row.id], fromJSOrdered(row.configuration));
            store.setIn(['configRows', action.componentId, configuration.id, row.id], fromJS(row));
          });
        });
      });
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_ERROR:
      _store = _store.deleteIn(['configsDataLoading', action.componentId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_START:
      var { componentId } = action;
      var { configId } = action;
      var editingDataJson = JSON.parse(InstalledComponentsStore.getEditingRawConfigData(componentId, configId));

      var editingData = fromJSOrdered(editingDataJson);

      var dataToSave = editingData;
      _store = _store.setIn(['configDataSaving', componentId, configId], dataToSave);

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_SUCCESS:
      var configDataObject = fromJSOrdered(action.configData);
      _store = _store.setIn(['configData', action.componentId, action.configId], configDataObject);
      _store = _store.deleteIn(['configDataSaving', action.componentId, action.configId]);
      _store = _store.deleteIn(['rawConfigDataEditing', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_ERROR:
      _store = _store.deleteIn(['configDataSaving', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_START:
      ({ componentId } = action);
      ({ configId } = action);
      editingDataJson = JSON.parse(InstalledComponentsStore.getEditingRawConfigDataParameters(componentId, configId));
      editingData = fromJSOrdered(editingDataJson);
      dataToSave = editingData;
      _store = _store.setIn(['configDataParametersSaving', componentId, configId], dataToSave);

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_SUCCESS:
      configDataObject = fromJSOrdered(action.configData).get('parameters');
      path = ['configData', action.componentId, action.configId, 'parameters'];
      _store = _store.setIn(path, configDataObject);
      _store = _store.deleteIn(['configDataParametersSaving', action.componentId, action.configId]);
      _store = _store.deleteIn(['rawConfigDataParametersEditing', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_ERROR:
      _store = _store.deleteIn(['configDataParametersSaving', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_START:
      ({ componentId } = action);
      ({ configId } = action);
      var { forceData } = action;
      editingData = InstalledComponentsStore.getEditingConfigData(componentId, configId);
      dataToSave = forceData || editingData;
      _store = _store.setIn(['configDataSaving', componentId, configId], dataToSave);

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_SUCCESS:
      _store = _store.setIn(['configData', action.componentId, action.configId], fromJSOrdered(action.configData));
      _store = _store.deleteIn(['configDataSaving', action.componentId, action.configId]);
      _store = _store.deleteIn(['configDataEditing', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_ERROR:
      _store = _store.deleteIn(['configDataSaving', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_LOAD:
      _store = _store.set('isLoading', true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_START:
      _store = _store.setIn(
        ['editingConfigurations', action.componentId, action.configurationId, action.field],
        InstalledComponentsStore.getConfig(action.componentId, action.configurationId).get(action.field)
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_UPDATE:
      _store = _store.setIn(
        ['editingConfigurations', action.componentId, action.configurationId, action.field],
        action.value
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_CANCEL:
      _store = _store.deleteIn(['editingConfigurations', action.componentId, action.configurationId, action.field]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_START:
      _store = _store.setIn(['deletingConfigurations', action.componentId, action.configurationId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store
          .deleteIn(['components', action.componentId, 'configurations', action.configurationId])
          .deleteIn(['deletingConfigurations', action.componentId, action.configurationId]);

        if (!storeResult.getIn(['components', action.componentId, 'configurations']).count()) {
          return (storeResult = storeResult.deleteIn(['components', action.componentId]));
        }
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_START:
      _store = _store.setIn(['deletingConfigurations', action.componentId, action.configurationId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_FILTER_CHANGE:
      _store = _store.setIn(['filters', 'trash', action.filterType], action.filter);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store
          .deleteIn(['deletedComponents', action.componentId, 'configurations', action.configurationId])
          .deleteIn(['deletingConfigurations', action.componentId, action.configurationId]);

        if (!storeResult.getIn(['deletedComponents', action.componentId, 'configurations']).count()) {
          return (storeResult = storeResult.deleteIn(['deletedComponents', action.componentId]));
        }
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['deletingConfigurations', action.componentId, action.configurationId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['deletingConfigurations', action.componentId, action.configurationId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_START:
      _store = _store.setIn(['restoringConfigurations', action.componentId, action.configurationId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store
          .deleteIn(['deletedComponents', action.componentId, 'configurations', action.configurationId])
          .deleteIn(['restoringConfigurations', action.componentId, action.configurationId]);

        if (!storeResult.getIn(['deletedComponents', action.componentId, 'configurations'], Map()).count()) {
          return (storeResult = storeResult.deleteIn(['deletedComponents', action.componentId]));
        }
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['restoringConfigurations', action.componentId, action.configurationId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_START:
      _store = _store.setIn(['savingConfigurations', action.componentId, action.configurationId, action.field], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ERROR:
      _store = _store.deleteIn(['savingConfigurations', action.componentId, action.configurationId, action.field]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_SUCCESS:
      _store = _store
        .mergeIn(
          ['components', action.componentId, 'configurations', action.configurationId],
          fromJSOrdered(action.data)
        )
        .deleteIn(['savingConfigurations', action.componentId, action.configurationId, action.field])
        .deleteIn(['editingConfigurations', action.componentId, action.configurationId, action.field]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_SUCCESS:
      _store = _store
        .set('isLoading', false)
        .set('isLoaded', true)
        .set(
          'components',
          // convert to by key structure
          fromJSOrdered(action.components)
            .toMap()
            .map(component =>
              component.set(
                'configurations',
                component
                  .get('configurations')
                  .toMap()
                  .mapKeys((key, config) => config.get('id'))
              )
            )
            .mapKeys((key, component) => component.get('id'))
        );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_LOAD:
      _store = _store.set('isDeletedLoading', true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_LOAD_ERROR:
      _store = _store.set('isDeletedLoading', false);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.DELETED_COMPONENTS_LOAD_SUCCESS:
      _store = _store
        .set('isDeletedLoading', false)
        .set('isDeletedLoaded', true)
        .set(
          'deletedComponents',
          // convert to by key structure
          fromJSOrdered(action.components)
            .toMap()
            .map(component =>
              component.set(
                'configurations',
                component
                  .get('configurations')
                  .toMap()
                  .mapKeys((key, config) => config.get('id'))
              )
            )
            .mapKeys((key, component) => component.get('id'))
        );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_SUCCESS:
      _store = _store.withMutations(function(store) {
        let storeResult = store;
        if (!store.hasIn(['components', action.componentId])) {
          storeResult = store.setIn(['components', action.componentId], action.component.set('configurations', Map()));
        }

        return storeResult.setIn(
          ['components', action.componentId, 'configurations', action.configuration.id],
          fromJSOrdered(action.configuration)
        );
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_TOGGLE_MAPPING:
      if (_store.getIn(['openMappings', action.componentId, action.configId, action.index], false)) {
        _store = _store.setIn(['openMappings', action.componentId, action.configId, action.index], false);
      } else {
        _store = _store.setIn(['openMappings', action.componentId, action.configId, action.index], true);
      }

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_START:
      var currentMapping = InstalledComponentsStore.getConfigData(action.componentId, action.configId).getIn(
        ['storage', action.mappingType, action.storage, action.index],
        Map()
      );
      path = [
        'configDataEditingObject',
        action.componentId,
        action.configId,
        'storage',
        action.mappingType,
        action.storage,
        action.index
      ];
      _store = _store.setIn(path, currentMapping);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CANCEL:
      path = [
        'configDataEditingObject',
        action.componentId,
        action.configId,
        'storage',
        action.mappingType,
        action.storage,
        action.index
      ];
      _store = _store.deleteIn(path);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CHANGE:
      path = [
        'configDataEditingObject',
        action.componentId,
        action.configId,
        'storage',
        action.mappingType,
        action.storage,
        action.index
      ];
      _store = _store.setIn(path, action.value);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_START:
      path = [
        'pendingActions',
        action.componentId,
        action.configId,
        action.mappingType,
        action.storage,
        action.index,
        'save'
      ];
      _store = _store.setIn(path, true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_SUCCESS:
      _store = _store.withMutations(function(store) {
        path = [
          'pendingActions',
          action.componentId,
          action.configId,
          action.mappingType,
          action.storage,
          action.index,
          'save'
        ];
        let storeResult = store.deleteIn(path);

        path = [
          'configDataEditingObject',
          action.componentId,
          action.configId,
          'storage',
          action.mappingType,
          action.storage,
          action.index
        ];
        storeResult = storeResult.deleteIn(path);

        const storePath = ['configData', action.componentId, action.configId];
        return storeResult.setIn(storePath, fromJSOrdered(action.data.configuration));
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_ERROR:
      _store = _store.withMutations(function(store) {
        path = [
          'pendingActions',
          action.componentId,
          action.configId,
          action.mappingType,
          action.storage,
          action.index,
          'save'
        ];
        let storeResult = store.deleteIn(path);

        path = [
          'configDataEditingObject',
          action.componentId,
          action.configId,
          'storage',
          action.mappingType,
          action.storage,
          action.index
        ];
        return storeResult.deleteIn(path);
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_START:
      path = [
        'pendingActions',
        action.componentId,
        action.configId,
        action.mappingType,
        action.storage,
        action.index,
        'delete'
      ];
      _store = _store.setIn(path, true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_SUCCESS:
      _store = _store.withMutations(function(store) {
        path = [
          'pendingActions',
          action.componentId,
          action.configId,
          action.mappingType,
          action.storage,
          action.index,
          'delete'
        ];
        let storeResult = store.deleteIn(path);

        const storePath = ['configData', action.componentId, action.configId];
        return storeResult.setIn(storePath, fromJSOrdered(action.data.configuration));
      });

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_ERROR:
      path = [
        'pendingActions',
        action.componentId,
        action.configId,
        action.mappingType,
        action.storage,
        action.index,
        'delete'
      ];
      _store = _store.deleteIn(path);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_CANCEL:
      _store = _store
        .deleteIn(['templatedConfigValuesEditingValues', action.componentId, action.configId])
        .deleteIn(['templatedConfigValuesEditingString', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditingString', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditing', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_TEMPLATE:
      _store = _store.setIn(
        ['templatedConfigValuesEditingValues', action.componentId, action.configId, 'template'],
        action.template
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_PARAMS:
      _store = _store.setIn(
        ['templatedConfigValuesEditingValues', action.componentId, action.configId, 'params'],
        action.value
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_STRING:
      _store = _store.setIn(['templatedConfigValuesEditingString', action.componentId, action.configId], action.value);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_START:
      configData = InstalledComponentsStore.getConfigData(action.componentId, action.configId) || Map();
      ({ componentId } = action);
      ({ configId } = action);
      editingData = configData;
      editingData = editingData.setIn(['parameters', 'api'], TemplatesStore.getApiTemplate(action.componentId));

      if (_store.getIn(['templatedConfigValuesEditingString', componentId, configId], false)) {
        const editingConfigValueString = InstalledComponentsStore.getTemplatedConfigEditingValueString(
          componentId,
          configId
        );
        editingData = editingData.setIn(['parameters', 'config'], fromJSOrdered(JSON.parse(editingConfigValueString)));
      } else {
        // params on the first place
        const editingParams = InstalledComponentsStore.getTemplatedConfigEditingValueParams(componentId, configId);
        editingData = editingData.setIn(['parameters', 'config'], editingParams);

        // merge the template
        const editingTemplate = InstalledComponentsStore.getTemplatedConfigEditingValueTemplate(componentId, configId);
        editingData = editingData.setIn(
          ['parameters', 'config'],
          editingData.getIn(['parameters', 'config'], Map()).merge(editingTemplate.get('data'))
        );
      }

      _store = _store.setIn(['configDataSaving', action.componentId, action.configId], editingData);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_SUCCESS:
      _store = _store
        .setIn(['configData', action.componentId, action.configId], fromJSOrdered(action.configData))
        .deleteIn(['templatedConfigValuesEditingValues', action.componentId, action.configId])
        .deleteIn(['templatedConfigValuesEditingString', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditing', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditingString', action.componentId, action.configId])
        .deleteIn(['configDataSaving', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_ERROR:
      _store = _store
        .deleteIn(['templatedConfigValuesEditingValues', action.componentId, action.configId])
        .deleteIn(['templatedConfigValuesEditingString', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditing', action.componentId, action.configId])
        .deleteIn(['templatedConfigEditingString', action.componentId, action.configId])
        .deleteIn(['configDataSaving', action.componentId, action.configId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_STRING_TOGGLE:
      ({ componentId } = action);
      ({ configId } = action);

      if (action.isStringEditingMode) {
        _store = _store.setIn(['templatedConfigEditingString', componentId, configId], true);
      } else {
        _store = _store
          .deleteIn(['templatedConfigValuesEditingString', action.componentId, action.configId])
          .deleteIn(['templatedConfigEditingString', action.componentId, action.configId]);
      }
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_SEARCH_CONFIGURATION_FILTER_CHANGE:
      _store = _store.setIn(['filters', 'installedComponents', action.componentType], action.filter);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_SEARCH_COMPONENT_DETAIL_FILTER_CHANGE:
      _store = _store.setIn(['filters', 'installedComponents', action.componentId], action.filter);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_START:
      var value = InstalledComponentsStore.getConfigRow(action.componentId, action.configurationId, action.rowId).get(
        action.field
      );
      if (value === '' && action.fallbackValue) {
        value = action.fallbackValue;
      }
      _store = _store.withMutations(store =>
        store.setIn(
          ['editingConfigurationRows', action.componentId, action.configurationId, action.rowId, action.field],
          value
        )
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_UPDATE:
      _store = _store.setIn(
        ['editingConfigurationRows', action.componentId, action.configurationId, action.rowId, action.field],
        action.value
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_CANCEL:
      _store = _store.deleteIn([
        'editingConfigurationRows',
        action.componentId,
        action.configurationId,
        action.rowId,
        action.field
      ]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_START:
      _store = _store.setIn(
        ['savingConfigurationRows', action.componentId, action.configurationId, action.rowId, action.field],
        true
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_ERROR:
      _store = _store.deleteIn([
        'savingConfigurationRows',
        action.componentId,
        action.configurationId,
        action.rowId,
        action.field
      ]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_SUCCESS:
      _store = _store
        .mergeIn(['configRows', action.componentId, action.configurationId, action.rowId], fromJSOrdered(action.data))
        .mergeIn(
          ['configRowsData', action.componentId, action.configurationId, action.rowId],
          fromJSOrdered(action.data.configuration)
        )
        .deleteIn(['savingConfigurationRows', action.componentId, action.configurationId, action.rowId, action.field])
        .deleteIn(['editingConfigurationRows', action.componentId, action.configurationId, action.rowId, action.field]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_START:
      _store = _store.setIn(['creatingConfigurationRows', action.componentId, action.configurationId], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_ERROR:
      _store = _store.deleteIn(['creatingConfigurationRows', action.componentId, action.configurationId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_SUCCESS:
      _store = _store
        .setIn(['configRows', action.componentId, action.configurationId, action.data.id], fromJSOrdered(action.data))
        .setIn(
          ['configRowsData', action.componentId, action.configurationId, action.data.id],
          fromJSOrdered(action.data.configuration)
        )
        .deleteIn(['creatingConfigurationRows', action.componentId, action.configurationId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_START:
      _store = _store.setIn(
        ['deletingConfigurationRows', action.componentId, action.configurationId, action.rowId],
        true
      );
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_ERROR:
      _store = _store.deleteIn(['deletingConfigurationRows', action.componentId, action.configurationId, action.rowId]);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_SUCCESS:
      _store = _store
        .deleteIn(['deletingConfigurationRows', action.componentId, action.configurationId, action.rowId])
        .deleteIn(['configRows', action.componentId, action.configurationId, action.rowId])
        .deleteIn(['configRowsData', action.componentId, action.configurationId, action.rowId]);

      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_CLEAR_INPUT_TABLE_STATE_START:
      _store = _store.setIn(['pendingActions', action.componentId, action.configurationId, 'clear-state'], true);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_CLEAR_INPUT_TABLE_STATE_ERROR:
      _store = _store.deleteIn(['pendingActions', action.componentId, action.configurationId, 'clear-state']);
      return InstalledComponentsStore.emitChange();

    case constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_CLEAR_INPUT_TABLE_STATE_SUCCESS:
      _store = _store
        .deleteIn(['pendingActions', action.componentId, action.configurationId, 'clear-state'])
        .setIn(['components', action.componentId, 'configurations', action.configId], Immutable.fromJS(action.configuration));
      return InstalledComponentsStore.emitChange();
    default:
  }
});

export default InstalledComponentsStore;
