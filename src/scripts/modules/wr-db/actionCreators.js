import Promise from 'bluebird';
import _ from 'underscore';
import api from './api';
import store from './store';
import dispatcher from '../../Dispatcher';
import constants from './constants';
import provisioningUtils from './provisioningUtils';
import { fromJS } from 'immutable';
import provisioningTemplates from './templates/provisioning';

const convertFromProvCredentials = (creds, driver) => {
  const mappings = provisioningTemplates[driver].fieldsMapping;
  const result = {};
  for (let key of Array.from(_.keys(mappings))) {
    result[key] = creds.get(mappings[key]);
  }
  result.port = provisioningTemplates[driver].defaultPort;
  result.driver = driver;
  return result;
};

export default {
  resetProvisioning(componentId, configId, driver) {
    const currentProvisioningCredentials = store.getProvisioningCredentials(componentId, configId);
    return provisioningUtils.clearAll(componentId, configId, driver, currentProvisioningCredentials);
  },

  loadProvisioningCredentials(componentId, configId, isReadOnly, driver) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_START,
      componentId,
      configId
    });
    const resetPromise = isReadOnly ? Promise.resolve() : this.resetProvisioning(componentId, configId, driver);
    return resetPromise.then(() => {
      return provisioningUtils
        .getCredentials(isReadOnly, driver, componentId, configId)
        .then(result => {
          if (isReadOnly) {
            return dispatcher.handleViewAction({
              type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_SUCCESS,
              componentId,
              configId,
              credentials: result
            });
          } else {
            const writeCreds = fromJS(convertFromProvCredentials(result.write, driver));
            return this.saveCredentials(componentId, configId, writeCreds).then(() =>
              dispatcher.handleViewAction({
                type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_SUCCESS,
                componentId,
                configId,
                credentials: result
              })
            );
          }
        })
        .catch(err => {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.WR_DB_API_ERROR,
            componentId,
            configId,
            error: err
          });
          throw err;
        });
    });
  },

  loadTableConfig(componentId, configId, tableId) {
    if (store.hasTableConfig(componentId, configId, tableId)) {
      return Promise.resolve();
    }
    return this.loadTableConfigForce(componentId, configId, tableId);
  },

  loadTableConfigForce(componentId, configId, tableId) {
    return api(componentId)
      .getTable(configId, tableId)
      .then(result =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_GET_TABLE_SUCCESS,
          componentId,
          configId,
          tableId,
          tableConfig: result
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  },

  resetCredentials(componentId, configId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_SUCCESS,
      componentId,
      configId,
      credentials: null
    });
  },

  setEditingData(componentId, configId, path, data) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_SET_EDITING,
      componentId,
      configId,
      path,
      data
    });
  },

  addTableToConfig(componentId, configId, tableId, sapiTable) {
    const table = {
      id: tableId,
      dbName: sapiTable.get('name'),
      name: sapiTable.get('name'),
      export: true
    };
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_ADD_TABLE_START,
      componentId,
      configId,
      tableId,
      table
    });
    return api(componentId)
      .postTable(configId, tableId, table, sapiTable)
      .then(() => {
        return this.loadTableConfig(componentId, configId, tableId).then(() =>
          dispatcher.handleViewAction({
            type: constants.ActionTypes.WR_DB_ADD_TABLE_SUCCESS,
            componentId,
            configId,
            tableId,
            table
          })
        );
      })
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  },

  saveCredentials(componentId, configId, credentials) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_START,
      componentId,
      configId,
      credentials
    });
    return api(componentId)
      .postCredentials(configId, credentials.toJS())
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_SUCCESS,
          componentId,
          configId,
          credentials
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          errorPath: ['savingCredentials', componentId, configId],
          error: err
        });
        throw err;
      });
  },

  loadConfiguration(componentId, configId) {
    if (store.hasConfiguration(componentId, configId)) {
      return Promise.resolve();
    }
    return this.loadConfigurationForce(componentId, configId);
  },

  loadConfigurationForce(componentId, configId) {
    return Promise.props({
      componentId,
      configId,
      credentials: api(componentId).getCredentials(configId),
      tables: api(componentId).getTables(configId)
    })
      .then(result =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_GET_CONFIGURATION_SUCCESS,
          componentId,
          configId,
          config: result
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  },
  deleteTable(componentId, configId, tableId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_DELETE_TABLE_START,
      componentId,
      configId,
      tableId
    });

    return api(componentId)
      .deleteTable(configId, tableId)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_DELETE_TABLE_SUCCESS,
          componentId,
          configId,
          tableId
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  },

  saveTableColumns(componentId, configId, tableId, columns) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_SAVE_COLUMNS_START,
      componentId,
      configId,
      tableId,
      columns
    });

    return api(componentId)
      .setTableColumns(configId, tableId, columns.toJS())
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_SAVE_COLUMNS_SUCCESS,
          componentId,
          configId,
          tableId,
          columns
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  },

  setTableToExport(componentId, configId, tableId, dbName, isExported) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.WR_DB_SET_TABLE_START,
      componentId,
      configId,
      tableId,
      dbName,
      isExported
    });
    return api(componentId)
      .setTable(configId, tableId, dbName, isExported)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_SET_TABLE_SUCCESS,
          componentId,
          configId,
          tableId,
          dbName,
          isExported
        })
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.WR_DB_API_ERROR,
          componentId,
          configId,
          error: err
        });
        throw err;
      });
  }
};
