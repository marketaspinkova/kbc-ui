import Dispatcher from '../../Dispatcher';
import Constants from './ConfigurationsConstants';
import ConfigurationsStore from './ConfigurationsStore';
import InstalledComponentsApi from '../components/InstalledComponentsApi';
import VersionActionCreators from '../components/VersionsActionCreators';
import ApplicationStore from '../../stores/ApplicationStore';
import DockerActionsActionCreators from './DockerActionsActionCreators';
import preferEncryptedAttributes from '../components/utils/preferEncryptedAttributes';
import Immutable from 'immutable';
import * as oauthUtils from '../oauth-v2/OauthUtils';

const storeEncodedConfiguration = function(componentId, configurationId, configuration, changeDescription) {
  const dataToSavePrepared = JSON.stringify(preferEncryptedAttributes(configuration));
  const projectId = ApplicationStore.getCurrentProject().get('id');
  return InstalledComponentsApi.encryptConfiguration(componentId, projectId, dataToSavePrepared).then(function(encryptedResponse) {
    const dataToSaveEncrypted = {
      configuration: JSON.stringify(encryptedResponse.body),
      changeDescription: changeDescription
    };
    return InstalledComponentsApi.updateComponentConfiguration(componentId, configurationId, dataToSaveEncrypted);
  });
};

export default {
  updateConfiguration: function(componentId, configurationId, value) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_UPDATE_CONFIGURATION,
      componentId: componentId,
      configurationId: configurationId,
      value: value
    });
  },

  resetConfiguration: function(componentId, configurationId) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_RESET_CONFIGURATION,
      componentId: componentId,
      configurationId: configurationId
    });
  },

  saveJsonConfiguration: function(componentId, configurationId, changeDescription) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId
    });
    const configuration = Immutable.fromJS(JSON.parse(ConfigurationsStore.getEditingJsonConfigurationString(componentId, configurationId)));

    return storeEncodedConfiguration(componentId, configurationId, configuration.toJS(), changeDescription ? changeDescription : 'Configuration parameters edited manually')
      .then(function(storedConfiguration) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          value: Immutable.fromJS(storedConfiguration).get('configuration')
        });
      }).catch(function(e) {
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_JSON_CONFIGURATION_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          error: e
        });
        throw e;
      });
  },

  updateJsonConfiguration: function(componentId, configurationId, value) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_UPDATE_JSON_CONFIGURATION,
      componentId: componentId,
      configurationId: configurationId,
      value: value
    });
  },

  resetJsonConfiguration: function(componentId, configurationId) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_RESET_JSON_CONFIGURATION,
      componentId: componentId,
      configurationId: configurationId
    });
  },

  openJsonEditor: function(componentId, configurationId) {
    this.resetConfiguration(componentId, configurationId);
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_JSON_EDITOR_OPEN,
      componentId: componentId,
      configurationId: configurationId
    });
  },

  closeJsonEditor: function(componentId, configurationId) {
    this.resetJsonConfiguration(componentId, configurationId);
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_JSON_EDITOR_CLOSE,
      componentId: componentId,
      configurationId: configurationId
    });
  },


  saveConfiguration: function(componentId, configurationId, createFn, parseFn, changeDescription) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId
    });
    const configuration = createFn(ConfigurationsStore.getEditingConfiguration(componentId, configurationId, parseFn));
    return storeEncodedConfiguration(componentId, configurationId, configuration.toJS(), changeDescription ? changeDescription : 'Configuration edited')
      .then(function(response) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          configuration: response
        });
        DockerActionsActionCreators.reloadIndexSyncActions(componentId, configurationId);
      }).catch(function(e) {
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          error: e
        });
        throw e;
      });
  },


  saveForcedConfiguration: function(componentId, configurationId, forcedConfiguration, changeDescription) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_START,
      componentId: componentId,
      configurationId: configurationId
    });
    return storeEncodedConfiguration(componentId, configurationId, forcedConfiguration.toJS(), changeDescription ? changeDescription : 'Configuration edited')
      .then(function(response) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          configuration: response
        });
        DockerActionsActionCreators.reloadIndexSyncActions(componentId, configurationId);
      }).catch(function(e) {
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_SAVE_CONFIGURATION_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          error: e
        });
        throw e;
      });
  },

  orderRows: function(componentId, configurationId, rowIds, movedRowId, changeDescription) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_START,
      componentId: componentId,
      configurationId: configurationId,
      rowId: movedRowId,
      rowIds: rowIds
    });
    return InstalledComponentsApi.orderRows(componentId, configurationId, rowIds, changeDescription ? changeDescription : 'Rows order changed')
      .then(function(response) {
        VersionActionCreators.loadVersionsForce(componentId, configurationId);
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_SUCCESS,
          componentId: componentId,
          configurationId: configurationId,
          response: response
        });
      }).catch(function(e) {
        Dispatcher.handleViewAction({
          type: Constants.ActionTypes.CONFIGURATIONS_ORDER_ROWS_ERROR,
          componentId: componentId,
          configurationId: configurationId,
          error: e
        });
        throw e;
      });
  },

  resetOauthCredentials(componentId, configurationId) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_START,
      componentId: componentId,
      configurationId: configurationId
    });

    oauthUtils.deleteCredentialsAndConfigAuth(componentId, configurationId).then(function() {
      VersionActionCreators.loadVersionsForce(componentId, configurationId);
      Dispatcher.handleViewAction({
        type: Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_SUCCESS,
        componentId: componentId,
        configurationId: configurationId
      });
      DockerActionsActionCreators.reloadIndexSyncActions(componentId, configurationId);
    }).catch(function(e) {
      Dispatcher.handleViewAction({
        type: Constants.ActionTypes.CONFIGURATIONS_OAUTH_RESET_ERROR,
        componentId: componentId,
        configurationId: configurationId,
        error: e
      });
      throw e;
    });
  }
};
