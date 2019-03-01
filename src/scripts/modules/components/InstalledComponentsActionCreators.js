import Promise from 'bluebird';
import _ from 'underscore';
import Immutable from 'immutable';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import JobsActionCreators from '../../modules/jobs/ActionCreators';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';
import componentRunner from './ComponentRunner';
import InstalledComponentsStore from './stores/InstalledComponentsStore';
import installedComponentsApi from './InstalledComponentsApi';
import ApplicationStore from '../../stores/ApplicationStore';
import RoutesStore from '../../stores/RoutesStore';
import ComponentsStore from './stores/ComponentsStore';
import VersionActionCreators from '../components/VersionsActionCreators';
import deleteComponentConfiguration from './utils/deleteComponentConfiguration';
import preferEncryptedAttributes from './utils/preferEncryptedAttributes';
import {isObsoleteComponent} from '../trash/utils';
import jobScheduledNotification from './react/components/notifications/jobScheduled';
import configurationRestoredNotification from './react/components/notifications/configurationRestored';
import configurationMovedToTrash from './react/components/notifications/configurationMovedToTrash';
import configurationMovedToTrashWithRestore from './react/components/notifications/configurationMovedToTrashWithRestore';

const storeEncodedConfig = function(componentId, configId, dataToSave, changeDescription) {
  const dataToSavePrepared = JSON.stringify(preferEncryptedAttributes(dataToSave));
  let projectId = ApplicationStore.getCurrentProject().get('id');
  return installedComponentsApi.encryptConfiguration(componentId, projectId, dataToSavePrepared).then(function(encryptedResponse) {
    const dataToSaveEncrypted = {
      configuration: JSON.stringify(encryptedResponse.body),
      changeDescription: changeDescription
    };
    return installedComponentsApi.updateComponentConfiguration(componentId, configId, dataToSaveEncrypted);
  });
};

const storeEncodedConfigRow = function(componentId, configId, rowId, dataToSave, changeDescription) {
  const dataToSavePrepared = JSON.stringify(preferEncryptedAttributes(dataToSave));
  let projectId = ApplicationStore.getCurrentProject().get('id');
  return installedComponentsApi.encryptConfiguration(componentId, projectId, dataToSavePrepared).then(function(encryptedResponse) {
    const dataToSaveEncrypted = {
      configuration: JSON.stringify(encryptedResponse.body),
      changeDescription: changeDescription
    };
    return installedComponentsApi.updateConfigurationRow(componentId, configId, rowId, dataToSaveEncrypted);
  });
};

export default {
  loadComponentsForce: function() {
    var promises;
    promises = [];
    promises.push(this.loadInstalledComponentsForce());
    promises.push(this.loadDeletedComponentsForce());
    return Promise.all(promises);
  },
  loadInstalledComponentsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_LOAD
    });
    return installedComponentsApi.getComponents().then(function(components) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_SUCCESS,
        components: components
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },
  loadDeletedComponentsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_COMPONENTS_LOAD
    });
    return installedComponentsApi.getDeletedComponents().then(function(components) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_LOAD_SUCCESS,
        components: components
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_LOAD_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },
  loadComponentConfigDataForce: function(componentId, configId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD,
      componentId: componentId,
      configId: configId
    });
    return installedComponentsApi.getComponentConfiguration(componentId, configId).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS,
        componentId: componentId,
        configId: configId,
        data: response
      });
      return response.configuration;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_ERROR,
        componentId: componentId,
        configId: configId
      });
      throw error;
    });
  },
  loadComponentConfigData: function(componentId, configId) {
    if (InstalledComponentsStore.getIsConfigDataLoaded(componentId, configId)) {
      this.loadComponentConfigDataForce(componentId, configId);
      return Promise.resolve();
    } else {
      return this.loadComponentConfigDataForce(componentId, configId);
    }
  },
  loadComponentConfigsDataForce: function(componentId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD,
      componentId: componentId
    });
    return installedComponentsApi.getComponentConfigurations(componentId).then(function(configData) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS,
        componentId: componentId,
        configData: configData
      });
      return configData;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_ERROR,
        componentId: componentId
      });
      throw error;
    });
  },
  loadComponentConfigsData: function(componentId) {
    if (InstalledComponentsStore.getIsConfigsDataLoaded(componentId)) {
      this.loadComponentConfigsDataForce(componentId);
      return Promise.resolve();
    } else {
      return this.loadComponentConfigsDataForce(componentId);
    }
  },
  saveComponentRawConfigData: function(componentId, configId) {
    var dataToSave;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_START,
      componentId: componentId,
      configId: configId
    });
    dataToSave = InstalledComponentsStore.getSavingConfigData(componentId, configId);
    if (dataToSave) {
      dataToSave = dataToSave.toJS();
    }
    return storeEncodedConfig(componentId, configId, dataToSave, 'Update configuration').then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_SUCCESS,
        componentId: componentId,
        configId: configId,
        configData: response.configuration
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_SAVE_ERROR,
        componentId: componentId,
        configId: configId
      });
      throw error;
    });
  },
  saveComponentRawConfigDataParameters: function(componentId, configId) {
    var dataToSave, parametersToSave;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_START,
      componentId: componentId,
      configId: configId
    });
    parametersToSave = InstalledComponentsStore.getSavingConfigDataParameters(componentId, configId);
    if (parametersToSave) {
      parametersToSave = parametersToSave.toJS();
    }
    dataToSave = InstalledComponentsStore.getConfigData(componentId, configId);
    if (dataToSave) {
      dataToSave = dataToSave.toJS();
      dataToSave.parameters = parametersToSave;
    }
    return storeEncodedConfig(componentId, configId, dataToSave, 'Update parameters').then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_SUCCESS,
        componentId: componentId,
        configId: configId,
        configData: response.configuration
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_SAVE_ERROR,
        componentId: componentId,
        configId: configId
      });
      throw error;
    });
  },
  saveComponentConfigData: function(componentId, configId, forceData, changeDescription) {
    var dataToSave;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_START,
      componentId: componentId,
      configId: configId,
      forceData: forceData
    });
    dataToSave = InstalledComponentsStore.getSavingConfigData(componentId, configId);
    if (dataToSave) {
      dataToSave = dataToSave.toJS();
    }
    return storeEncodedConfig(componentId, configId, dataToSave, changeDescription).then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_SUCCESS,
        componentId: componentId,
        configId: configId,
        configData: response.configuration
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_SAVE_ERROR,
        componentId: componentId,
        configId: configId
      });
      throw error;
    });
  },
  updateLocalState: function(componentId, configId, data, path) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_LOCAL_STATE_UPDATE,
      componentId: componentId,
      configId: configId,
      data: data,
      path: path
    });
  },
  updateEditComponentConfigData: function(componentId, configId, newData) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_EDIT_UPDATE,
      componentId: componentId,
      configId: configId,
      data: newData
    });
  },
  cancelEditComponentConfigData: function(componentId, configId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGDATA_EDIT_CANCEL,
      componentId: componentId,
      configId: configId
    });
  },
  updateEditComponentRawConfigData: function(componentId, configId, newData) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_UPDATE,
      componentId: componentId,
      configId: configId,
      data: newData
    });
  },
  cancelEditComponentRawConfigData: function(componentId, configId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATA_EDIT_CANCEL,
      componentId: componentId,
      configId: configId
    });
  },
  updateEditComponentRawConfigDataParameters: function(componentId, configId, newData) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_UPDATE,
      componentId: componentId,
      configId: configId,
      data: newData
    });
  },
  cancelEditComponentRawConfigDataParameters: function(componentId, configId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_RAWCONFIGDATAPARAMETERS_EDIT_CANCEL,
      componentId: componentId,
      configId: configId
    });
  },
  loadComponents: function() {
    if (InstalledComponentsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadComponentsForce();
  },
  loadDeletedComponents: function() {
    if (InstalledComponentsStore.getIsDeletedLoaded()) {
      return Promise.resolve();
    }
    return this.loadDeletedComponentsForce();
  },
  receiveAllComponents: function(componentsRaw) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_SUCCESS,
      components: componentsRaw
    });
  },
  startConfigurationEdit: function(componentId, configurationId, field) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_START,
      componentId: componentId,
      configurationId: configurationId,
      field: field
    });
  },
  updateEditingConfiguration: function(componentId, configurationId, field, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_UPDATE,
      configurationId: configurationId,
      componentId: componentId,
      field: field,
      value: newValue
    });
  },
  cancelConfigurationEdit: function(componentId, configurationId, field) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_EDIT_CANCEL,
      componentId: componentId,
      configurationId: configurationId,
      field: field
    });
  },
  saveConfigurationEdit: function(componentId, configurationId, field) {
    var calledFunction, data, newValue;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId,
      field: field
    });
    newValue = InstalledComponentsStore.getEditingConfig(componentId, configurationId, field);
    if (field === 'configuration') {
      data = newValue;
      data.changeDescription = 'Update configuration';
      calledFunction = storeEncodedConfig;
    } else {
      data = {};
      data.changeDescription = 'Update ' + field;
      data[field] = newValue;
      calledFunction = installedComponentsApi.updateComponentConfiguration;
    }
    return calledFunction(componentId, configurationId, data).then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configurationId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_SUCCESS,
        componentId: componentId,
        configurationId: configurationId,
        field: field,
        data: response
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        field: field,
        error: e
      });
      throw e;
    });
  },
  restoreConfiguration: function(component, configuration, transition) {
    var componentId, configurationId, transitionParams, transitionTo;
    configurationId = configuration.get('id');
    componentId = component.get('id');
    dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId,
      transition: transition
    });
    if (transition) {
      transitionTo = 'generic-detail-' + (component.get('type'));
      transitionParams = {
        component: component.get('id')
      };
      RoutesStore.getRouter().transitionTo(transitionTo, transitionParams);
    }
    const actions = this;
    return installedComponentsApi.restoreConfiguration(componentId, configurationId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_SUCCESS,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition
      });
      return Promise.all([
        actions.loadInstalledComponentsForce(),
        actions.loadComponentConfigsDataForce(componentId)
      ]).then(function() {
        return ApplicationActionCreators.sendNotification({
          message: configurationRestoredNotification(componentId, configurationId, configuration)
        });
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_RESTORE_CONFIGURATION_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition,
        error: e
      });
      throw e;
    });
  },
  deletedConfigurationsFilterChange: function(query, filterType) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_COMPONENTS_FILTER_CHANGE,
      filter: query,
      filterType: filterType
    });
  },
  deleteConfiguration: function(componentId, configurationId, transition) {
    var component, configuration, transitionParams, transitionTo;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId,
      transition: transition
    });
    component = ComponentsStore.getComponent(componentId);
    configuration = InstalledComponentsStore.getConfig(componentId, configurationId);
    if (transition) {
      transitionTo = 'generic-detail-' + (component.get('type'));
      transitionParams = {
        component: component.get('id')
      };
      RoutesStore.getRouter().transitionTo(transitionTo, transitionParams);
    }
    const actions = this;
    return deleteComponentConfiguration(componentId, configurationId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition
      });
      if (isObsoleteComponent(componentId)) {
        return ApplicationActionCreators.sendNotification({
          message: configurationMovedToTrash(configuration)
        });
      } else {
        return ApplicationActionCreators.sendNotification({
          message: configurationMovedToTrashWithRestore(component, configuration, function() {
            return actions.restoreConfiguration(component, configuration);
          })
        });
      }
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition,
        error: e
      });
      throw e;
    });
  },
  deleteAllConfigurationsPermanently: function() {
    var actions, promises;
    promises = [];
    actions = this;
    InstalledComponentsStore.getAllDeleted().forEach(function(component) {
      var componentId;
      componentId = component.get('id');
      component.get('configurations').forEach(function(configuration) {
        var configurationId;
        configurationId = configuration.get('id');
        promises.push(actions.deleteConfigurationPermanently(componentId, configurationId, false));
      });
    });
    return Promise.all(promises);
  },
  deleteConfigurationPermanently: function(componentId, configurationId, transition) {
    var component, configuration, notification, transitionParams, transitionTo;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId,
      transition: transition
    });
    component = ComponentsStore.getComponent(componentId);
    configuration = InstalledComponentsStore.getDeletedConfig(componentId, configurationId);
    notification = 'Configuration ' + (configuration.get('name')) + ' was permanently deleted.';
    if (transition) {
      transitionTo = 'generic-detail-' + (component.get('type'));
      transitionParams = {
        component: component.get('id')
      };
      RoutesStore.getRouter().transitionTo(transitionTo, transitionParams);
    }
    return installedComponentsApi.deleteConfiguration(componentId, configurationId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition
      });
      return ApplicationActionCreators.sendNotification({
        message: notification
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_COMPONENTS_DELETE_CONFIGURATION_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        transition: transition,
        error: e
      });
      throw e;
    });
  },

  /*
    params:
      - component - id of component like ex-db
      - data - action parameters hashmap
      - method - default = run
      - notify - send notification, default true
   */
  runComponent: function(params) {
    var defaultParams;
    defaultParams = {
      method: 'run',
      notify: true
    };
    const paramsProcessed = _.extend({}, defaultParams, params);
    return componentRunner.run({
      component: paramsProcessed.component,
      data: paramsProcessed.data,
      method: paramsProcessed.method
    }).then(function(runJobResult) {
      var loadJobDataPromise;
      loadJobDataPromise = Promise.resolve(runJobResult);
      if (paramsProcessed.component === 'gooddata-writer') {
        loadJobDataPromise = JobsActionCreators.reloadJobs().then(function() {
          return runJobResult;
        });
      }
      return loadJobDataPromise.then(function(job) {
        if (paramsProcessed.notify) {
          const component = ComponentsStore.getComponent(paramsProcessed.component);
          ApplicationActionCreators.sendNotification({
            message: jobScheduledNotification(component, job.id)
          });
        }
        return job;
      });
    });
  },
  toggleMapping: function(componentId, configId, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_TOGGLE_MAPPING,
      componentId: componentId,
      configId: configId,
      index: index
    });
  },
  startEditingMapping: function(componentId, configId, type, storage, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_START,
      componentId: componentId,
      configId: configId,
      mappingType: type,
      storage: storage,
      index: index
    });
  },
  cancelEditingMapping: function(componentId, configId, type, storage, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CANCEL,
      componentId: componentId,
      configId: configId,
      mappingType: type,
      storage: storage,
      index: index
    });
  },
  changeEditingMapping: function(componentId, configId, type, storage, index, value) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_EDITING_CHANGE,
      componentId: componentId,
      configId: configId,
      mappingType: type,
      storage: storage,
      index: index,
      value: value
    });
  },
  saveEditingMapping: function(componentId, configId, type, storage, index, changeDescription) {
    var data, dataToSave, lastIndex, mappingData, pathDestination, pathSource;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_START,
      componentId: componentId,
      configId: configId,
      mappingType: type,
      storage: storage,
      index: index
    });
    dataToSave = InstalledComponentsStore.getConfigData(componentId, configId);
    mappingData = InstalledComponentsStore.getEditingConfigDataObject(componentId, configId);
    if (!dataToSave.hasIn(['storage', type, storage])) {
      dataToSave = dataToSave.setIn(['storage', type, storage], Immutable.List());
    }
    pathSource = ['storage', type, storage, index];
    if (index === 'new-mapping') {
      lastIndex = dataToSave.getIn(['storage', type, storage], Immutable.List()).count();
      pathDestination = ['storage', type, storage, lastIndex];
    } else {
      pathDestination = pathSource;
    }
    data = dataToSave.setIn(pathDestination, mappingData.getIn(pathSource)).toJSON();
    return storeEncodedConfig(componentId, configId, data, changeDescription).then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_SUCCESS,
        componentId: componentId,
        configId: configId,
        mappingType: type,
        storage: storage,
        index: index,
        data: response
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_SAVE_ERROR,
        componentId: componentId,
        configId: configId,
        error: e
      });
      throw e;
    });
  },
  deleteMapping: function(componentId, configId, type, storage, index, changeDescription) {
    var data, dataToSave, path;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_START,
      componentId: componentId,
      configId: configId,
      mappingType: type,
      storage: storage,
      index: index
    });
    dataToSave = InstalledComponentsStore.getConfigData(componentId, configId);
    path = ['storage', type, storage, index];
    data = dataToSave.deleteIn(path).toJSON();
    return storeEncodedConfig(componentId, configId, data, changeDescription).then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_SUCCESS,
        componentId: componentId,
        configId: configId,
        mappingType: type,
        storage: storage,
        index: index,
        data: response
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_MAPPING_DELETE_ERROR,
        componentId: componentId,
        configId: configId,
        error: e
      });
      throw e;
    });
  },
  cancelEditTemplatedComponentConfigData: function(componentId, configId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_CANCEL,
      componentId: componentId,
      configId: configId
    });
  },
  updateEditTemplatedComponentConfigDataTemplate: function(componentId, configId, template) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_TEMPLATE,
      componentId: componentId,
      configId: configId,
      template: template
    });
  },
  updateEditTemplatedComponentConfigDataString: function(componentId, configId, value) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_STRING,
      componentId: componentId,
      configId: configId,
      value: value
    });
  },
  updateEditTemplatedComponentConfigDataParams: function(componentId, configId, value) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_UPDATE_PARAMS,
      componentId: componentId,
      configId: configId,
      value: value
    });
  },
  saveEditTemplatedComponentConfigData: function(componentId, configId) {
    var dataToSave;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_START,
      componentId: componentId,
      configId: configId
    });
    dataToSave = InstalledComponentsStore.getSavingConfigData(componentId, configId);
    if (dataToSave) {
      dataToSave = dataToSave.toJS();
    }
    return storeEncodedConfig(componentId, configId, dataToSave, 'Update parameters').then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_SUCCESS,
        componentId: componentId,
        configId: configId,
        configData: response.configuration
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_SAVE_ERROR,
        componentId: componentId,
        configId: configId
      });
      throw error;
    });
  },
  toggleEditTemplatedComponentConfigDataString: function(componentId, configId, isStringEditingMode) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_TEMPLATED_CONFIGURATION_EDIT_STRING_TOGGLE,
      componentId: componentId,
      configId: configId,
      isStringEditingMode: isStringEditingMode
    });
  },
  setInstalledComponentsConfigurationFilter: function(componentType, query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_SEARCH_CONFIGURATION_FILTER_CHANGE,
      componentType: componentType,
      filter: query
    });
  },
  setInstalledComponentsComponentDetailFilter: function(componentId, query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_SEARCH_COMPONENT_DETAIL_FILTER_CHANGE,
      componentId: componentId,
      filter: query
    });
  },
  startConfigurationRowEdit: function(componentId, configurationId, rowId, field, fallbackValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_START,
      componentId: componentId,
      configurationId: configurationId,
      rowId: rowId,
      fallbackValue: fallbackValue,
      field: field
    });
  },
  updateEditingConfigurationRow: function(componentId, configurationId, rowId, field, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_UPDATE,
      configurationId: configurationId,
      componentId: componentId,
      rowId: rowId,
      field: field,
      value: newValue
    });
  },
  cancelConfigurationRowEdit: function(componentId, configurationId, rowId, field) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CONFIGURATION_ROW_EDIT_CANCEL,
      componentId: componentId,
      configurationId: configurationId,
      rowId: rowId,
      field: field
    });
  },
  saveConfigurationRowEdit: function(componentId, configurationId, rowId, field) {
    var calledFunction, data, newValue;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_START,
      componentId: componentId,
      configurationId: configurationId,
      rowId: rowId,
      field: field
    });
    let changeDescription;
    newValue = InstalledComponentsStore.getEditingConfigRow(componentId, configurationId, rowId, field);
    if (field === 'configuration') {
      data = newValue;
      changeDescription = 'Update configuration';
      calledFunction = storeEncodedConfigRow;
    } else {
      data = {};
      changeDescription = 'Update ' + field;
      data[field] = newValue;
      calledFunction = installedComponentsApi.updateConfigurationRow;
    }
    return calledFunction(componentId, configurationId, rowId, data, changeDescription).then(function(response) {
      VersionActionCreators.loadVersionsForce(componentId, configurationId);
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_SUCCESS,
        componentId: componentId,
        configurationId: configurationId,
        rowId: rowId,
        field: field,
        data: response
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        rowId: rowId,
        field: field,
        error: e
      });
      throw e;
    });
  },
  createConfigurationRow: function(componentId, configurationId, data, changeDescription) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_START,
      componentId: componentId,
      configurationId: configurationId,
      data: data
    });
    return installedComponentsApi.createConfigurationRow(componentId, configurationId, data, changeDescription)
      .then(function(response) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          data: response
        });
      }).catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_CREATE_CONFIGURATION_ROW_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          error: e
        });
        throw e;
      });
  },
  deleteConfigurationRow: function(componentId, configurationId, rowId, changeDescription) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_START,
      componentId: componentId,
      configurationId: configurationId,
      rowId: rowId
    });
    return installedComponentsApi.deleteConfigurationRow(componentId, configurationId, rowId, changeDescription)
      .then(function() {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          rowId: rowId
        });
      }).catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ROW_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          rowId: rowId,
          error: e
        });
        throw e;
      });
  },
  updateConfigurationRow: function(componentId, configurationId, rowId, data, changeDescription) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_START,
      componentId: componentId,
      configurationId: configurationId,
      rowId: rowId,
      data: data
    });
    return installedComponentsApi.updateConfigurationRow(componentId, configurationId, rowId, data, changeDescription)
      .then(function(response) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          rowId: rowId,
          data: response
        });
      }).catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_ROW_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          rowId: rowId,
          error: e
        });
        throw e;
      });
  }
};
