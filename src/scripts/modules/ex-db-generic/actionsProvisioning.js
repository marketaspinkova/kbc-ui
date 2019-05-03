import * as storeProvisioning from './storeProvisioning';
import {List, Map, fromJS} from 'immutable';
import RoutesStore from '../../stores/RoutesStore';

import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';

import getDefaultPort from './templates/defaultPorts';
import {getProtectedProperties} from './templates/credentials';
import {incrementalFetchingTypes} from './templates/incrementalFetchingCandidates';

export function loadConfiguration(componentId, configId) {
  return componentsActions.loadComponentConfigData(componentId, configId);
}

export function loadSourceTables(componentId, configId) {
  const actions = createActions(componentId);
  const store = storeProvisioning.createStore(componentId, configId);
  if (store.hasValidCredentials(store.getCredentials()) && (!store.hasConnectionBeenTested() || !store.getSourceTables())) {
    if (!store.hasConnectionBeenTested()) {
      actions.updateLocalState(configId, storeProvisioning.TESTING_CONNECTION_PATH, true);
      return actions.testSavedCredentials(configId).then((connectionValid) => {
        actions.updateLocalState(configId, storeProvisioning.TESTING_CONNECTION_PATH, false);
        if (connectionValid && componentSupportsSimpleSetup(componentId)) {
          return createActions(componentId).getSourceTables(configId);
        }
      });
    }
    if (componentSupportsSimpleSetup(componentId)) {
      return createActions(componentId).getSourceTables(configId);
    }
  }
}

export function reloadSourceTables(componentId, configId) {
  if (componentSupportsSimpleSetup(componentId)) {
    createActions(componentId).updateLocalState(configId, storeProvisioning.LOADING_SOURCE_TABLES_PATH, true);
    return createActions(componentId).getSourceTables(configId);
  }
}

export function componentSupportsSimpleSetup(componentId) {
  const supportedComponents = [
    'keboola.ex-db-mysql',
    'keboola.ex-db-redshift',
    'keboola.ex-db-redshift-cursors',
    'keboola.ex-db-snowflake',
    'keboola.ex-db-mssql',
    'keboola.ex-db-oracle',
    'keboola.ex-db-db2',
    'keboola.ex-db-pgsql',
    'keboola.ex-teradata'
  ];
  return supportedComponents.indexOf(componentId) > -1;
}

export function componentSupportsConfigRows(componentId) {
  const supoortedComponents = [
    'keboola.ex-db-mysql',
    'keboola.ex-db-mssql',
    'keboola.ex-db-pgsql',
    'keboola.ex-teradata'
  ];
  return supoortedComponents.indexOf(componentId) > -1;
}

export function createActions(componentId) {
  function resetProtectedProperties(credentials) {
    const props = List(getProtectedProperties(componentId));
    return props.reduce((memo, prop) => memo.set(prop, ''), credentials);
  }

  function updateProtectedProperties(newCredentials, oldCredentials) {
    const props = getProtectedProperties(componentId);
    const propsList = List(props);
    const result = propsList.reduce((memo, prop) => {
      const newValue = newCredentials.get(prop);
      const oldValue = oldCredentials.get(prop);
      if (!newValue) {
        return memo.set(prop, oldValue);
      }
      return memo;
    }, newCredentials);
    return result;
  }

  function getStore(configId) {
    return storeProvisioning.createStore(componentId, configId);
  }

  function saveConfigData(configId, data, waitingPath, changeDescription) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.saveComponentConfigData(componentId, configId, data, changeDescription)
      .then(() => updateLocalState(configId, waitingPath, false));
  }

  function createConfigRow(configId, data, waitingPath, changeDescription) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.createConfigurationRow(componentId, configId, data, changeDescription)
      .then(() => {
        updateLocalState(configId, waitingPath, false);
      });
  }

  function updateConfigRow(configId, rowId, data, waitingPath, changeDescription) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.updateConfigurationRow(componentId, configId, rowId.toString(), data, changeDescription)
      .then(() => updateLocalState(configId, waitingPath, false));
  }

  function deleteConfigRow(configId, rowId, waitingPath, changeDescription) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.deleteConfigurationRow(componentId, configId, rowId.toString(), changeDescription)
      .then(() => updateLocalState(configId, waitingPath, false));
  }

  function getLocalState(configId) {
    return getStore(configId).getLocalState();
  }

  function updateLocalState(configId, path, data) {
    const ls = getStore(configId).getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function removeFromLocalState(configId, path) {
    const ls = getStore(configId).getLocalState();
    const newLocalState = ls.deleteIn([].concat(path));
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function getPKColumsFromSourceTable(targetTable, sourceTables) {
    const matchedTable = sourceTables.find((table) =>
      table.get('schema') === targetTable.get('schema')
      && table.get('name') === targetTable.get('tableName')
    );
    if (!matchedTable) {
      return Map();
    }
    if (matchedTable.get('columns')) {
      return matchedTable.get('columns').filter((column) => column.get('primaryKey') === true);
    } else {
      return Map();
    }
  }

  function getIncrementalCandidates(sourceTables) {
    const allowedTypes = incrementalFetchingTypes.get(componentId, List());
    return sourceTables.reduce((memo, table) => {
      const qualifyingColumns = table.get('columns', List()).filter((column) => {
        return column.get('type') && allowedTypes.includes(column.get('type').toLowerCase());
      });
      if (qualifyingColumns.count() > 0) {
        return memo.push(Map({
          tableName: table.get('name'),
          schema: table.get('schema'),
          candidates: qualifyingColumns
        }));
      } else {
        return memo;
      }
    }, List());
  }

  function rowDataFromQuery(query) {
    const queryState = query.has('state') ? query.get('state').toJS() : {};
    const paramsQuery = query.delete('state').delete('name').delete('id').delete('enabled');
    return {
      'rowId': query.get('id'),
      'name': query.get('name'),
      'isDisabled': !query.get('enabled'),
      'configuration': JSON.stringify({
        'parameters': paramsQuery.toJS()
      }),
      'state': JSON.stringify(queryState)
    };
  }

  return {
    // Credentials Actions start
    editCredentials(configId) {
      const store = getStore(configId);
      let credentials = store.getCredentials();
      if (!credentials.get('port') &&  getDefaultPort(componentId)) {
        credentials = credentials.set('port', getDefaultPort(componentId));
      }
      credentials = resetProtectedProperties(credentials);
      updateLocalState(configId, 'editingCredentials', credentials);
    },

    cancelCredentialsEdit(configId) {
      removeFromLocalState(configId, ['isChangedCredentials']);
      removeFromLocalState(configId, ['editingCredentials']);
    },

    updateEditingCredentials(configId, newCredentials) {
      updateLocalState(configId, 'editingCredentials', newCredentials);
      if (!getLocalState(configId).get('isChangedCredentials', false)) {
        updateLocalState(configId, storeProvisioning.CONNECTION_TESTED_PATH, false);
        updateLocalState(configId, ['isChangedCredentials'], true);
      }
    },

    resetNewCredentials(configId) {
      updateLocalState(configId, ['newCredentials'], null);
    },

    updateNewCredentials(configId, newCredentials) {
      updateLocalState(configId, ['newCredentials'], newCredentials);
    },

    saveNewCredentials(configId) {
      const store = getStore(configId);
      let newCredentials = store.getNewCredentials();
      const testedCredentials = store.getTestedCredentials();
      newCredentials = updateProtectedProperties(newCredentials, store.getCredentials());
      let newData = store.configData.setIn(['parameters', 'db'], newCredentials);
      if (store.isRowConfiguration()) {
        newData = newData.deleteIn(['parameters', 'tables']);
      }
      const diffMsg = 'Save new credentials';
      return saveConfigData(configId, newData, ['isSavingCredentials'], diffMsg).then(() => {
        this.resetNewCredentials(configId);
        if (!testedCredentials === newCredentials) {
          this.updateLocalState(configId, storeProvisioning.CONNECTION_TESTED_PATH, false);
        }
        RoutesStore.getRouter().transitionTo(componentId, {config: configId});
      });
    },

    saveCredentialsEdit(configId) {
      const store = getStore(configId);
      const testedCredentials = store.getTestedCredentials();
      let credentials = store.getEditingCredentials();
      credentials = updateProtectedProperties(credentials, store.getCredentials());
      let newConfigData = store.configData.setIn(['parameters', 'db'], credentials);
      if (store.isRowConfiguration()) {
        newConfigData = newConfigData.deleteIn(['parameters', 'tables']);
      }
      const diffMsg = 'Update credentials';
      return saveConfigData(configId, newConfigData, ['isSavingCredentials'], diffMsg).then(() => {
        reloadSourceTables(componentId, configId);
        this.cancelCredentialsEdit(configId);
        if (testedCredentials !== credentials) {
          this.updateLocalState(configId, storeProvisioning.CONNECTION_TESTED_PATH, false);
        }
        RoutesStore.getRouter().transitionTo(componentId, {config: configId});
      });
    },

    testCredentials(configId, credentials) {
      const store = getStore(configId);
      const testingCredentials = updateProtectedProperties(credentials, store.getCredentials());
      let runData = store.configData.setIn(['parameters', 'db'], testingCredentials);
      if (!store.isRowConfiguration()) {
        runData = runData.setIn(['parameters', 'tables'], List());
      }
      const params = {
        configData: runData.toJS()
      };
      return callDockerAction(componentId, 'testConnection', params).then(function(data) {
        if (data.status === 'error') {
          updateLocalState(configId, storeProvisioning.CONNECTION_ERROR_PATH, fromJS(data.message));
          updateLocalState(configId, storeProvisioning.CONNECTION_VALID_PATH, false);
        } else if (data.status === 'success') {
          updateLocalState(configId, 'testedCredentials', testingCredentials);
          updateLocalState(configId, storeProvisioning.CONNECTION_VALID_PATH, true);
          updateLocalState(configId, storeProvisioning.CONNECTION_ERROR_PATH, null);
        }
        updateLocalState(configId, storeProvisioning.TESTING_CONNECTION_PATH, false);
        updateLocalState(configId, storeProvisioning.CONNECTION_TESTED_PATH, true);
        return data;
      });
    },

    testSavedCredentials(configId) {
      const store = getStore(configId);
      return this.testCredentials(configId, store.getCredentials()).then(function(data) {
        return data.status === 'success';
      });
    },
    // Credentials actions end

    setQueriesFilter(configId, query) {
      updateLocalState(configId, 'queriesFilter', query);
    },

    changeQueryEnabledState(configId, qid, newValue) {
      const store = getStore(configId);
      const newQueries = store.getQueries().map((q) => {
        if (q.get('id') === qid) {
          return q.set('enabled', newValue).delete('advancedMode');
        } else {
          return q.delete('advancedMode');
        }
      });
      const prefixMsg = !!newValue ? 'Enable' : 'Disable';
      const diffMsg = prefixMsg + ' query ' + store.getQueryName(qid);
      if (store.isRowConfiguration()) {
        const query = newQueries.find((q) => q.get('id') === qid);
        const rowData = rowDataFromQuery(query);
        return updateConfigRow(configId, qid, rowData, ['pending', qid, 'enabled'], diffMsg);
      }
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      return saveConfigData(configId, newData, ['pending', qid, 'enabled'], diffMsg);
    },

    checkTableName(query, store) {
      const defaultTableName = store.getDefaultOutputTableId(query.get('name', ''));
      if (query.get('outputTable', '').trim().length > 0) {
        return query;
      } else {
        return query.set('outputTable', defaultTableName);
      }
    },

    createQuery(configId) {
      const store = getStore(configId);
      const newQuery = this.checkTableName(store.generateNewQuery(null, componentSupportsSimpleSetup(componentId)), store);
      updateLocalState(configId, ['newQueries', newQuery.get('id')], newQuery);
      updateLocalState(configId, ['newQueriesIdsList'], store.getNewQueriesIdsList().unshift(newQuery.get('id')));
      this.changeQueryEdit(configId, newQuery);
      return newQuery;
    },

    deleteQuery(configId, qid) {
      const store = getStore(configId);
      removeFromLocalState(configId, ['newQueries', qid]);
      removeFromLocalState(configId, ['editingQueries', qid]);
      const newQueries = store.getQueries().filter((q) => q.get('id') !== qid);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      const diffMsg = 'Delete query ' + store.getQueryName(qid);
      if (store.isRowConfiguration()) {
        if (store.isNewQuery(qid)) {
          return;
        }
        return deleteConfigRow(configId, qid.toString(), ['pending', qid, 'deleteQuery'], diffMsg);
      }
      return saveConfigData(configId, newData, ['pending', qid, 'deleteQuery'], diffMsg);
    },

    prepareSingleQueryRunData(configId, query, source) {
      const store = getStore(configId);
      let runQuery = query;
      if (source === 'detail') {
        if (runQuery.get('advancedMode')) {
          runQuery = runQuery.delete('table');
          runQuery = runQuery.delete('columns');
          runQuery = runQuery.delete('incrementalFetchingColumn');
          runQuery = runQuery.delete('incrementalFetchingLimit');
        } else {
          if (runQuery.get('incrementalFetchingColumn') === '') {
            runQuery = runQuery.delete('incrementalFetchingColumn');
          }
          runQuery = runQuery.delete('query');
        }
        runQuery = runQuery.delete('advancedMode');
      }
      if (store.isRowConfiguration()) {
        return {
          config: configId,
          row: runQuery.get('id').toString()
        };
      } else {
        runQuery = runQuery.delete('incrementalFetchingColumn').delete('incrementalFetchingLimit');
        return {
          config: configId,
          configData: store.configData.setIn(['parameters', 'tables'], List().push(runQuery))
        };
      }
    },

    resetQueryEdit(configId, queryId) {
      removeFromLocalState(configId, ['isChanged', queryId]);
      removeFromLocalState(configId, ['isDestinationEditing', queryId]);
      const store = getStore(configId);
      if (store.isNewQuery(queryId)) {
        const newQuery = store.generateNewQuery(queryId, componentSupportsSimpleSetup(componentId));
        updateLocalState(configId, ['newQueries', queryId], newQuery);
        updateLocalState(configId, ['editingQueries', queryId], newQuery);
      } else {
        removeFromLocalState(configId, ['editingQueries', queryId]);
      }
    },

    destinationEdit(configId, queryId) {
      updateLocalState(configId, ['isDestinationEditing', queryId], true);
      if (!getLocalState(configId).get(['isChanged', queryId], false)) {
        updateLocalState(configId, ['isChanged', queryId], true);
      }
    },

    changeQueryEdit(configId, newQuery) {
      const queryId = newQuery.get('id');
      updateLocalState(configId, ['editingQueries', queryId], newQuery);
      if (!getLocalState(configId).getIn(['isChanged', queryId], false)) {
        updateLocalState(configId, ['isChanged', queryId], true);
      }
    },

    saveQueryEdit(configId, queryId) {
      const store = getStore(configId);
      let newQuery = store.getEditingQuery(queryId);
      if (newQuery.get('advancedMode')) {
        newQuery = newQuery.delete('table');
        newQuery = newQuery.delete('columns');
        newQuery = newQuery.delete('incrementalFetchingColumn');
        newQuery = newQuery.delete('incrementalFetchingLimit');
      } else {
        if (newQuery.get('incrementalFetchingColumn') === '') {
          newQuery = newQuery.delete('incrementalFetchingColumn');
        }
        newQuery = newQuery.delete('query');
      }
      newQuery = newQuery.delete('advancedMode');
      if (!store.isRowConfiguration()) {
        // if a table was made while this bug was alive https://github.com/keboola/kbc-ui/issues/1731,
        // need to remove the invalid parameters
        newQuery = newQuery.delete('incrementalFetchingColumn').delete('incrementalFetchingLimit');
      }
      newQuery = this.checkTableName(newQuery, store);

      var newQueries, diffMsg;
      if (store.getQueries().find((q) => q.get('id') === newQuery.get('id') )) {
        newQueries = store.getQueries().map((q) => q.get('id') === queryId ? newQuery : q);
        diffMsg = 'Edit query '  + newQuery.get('name');
      } else {
        newQueries = store.getQueries().push(newQuery);
        diffMsg = 'Create query ' + newQuery.get('name');
      }
      removeFromLocalState(configId, ['isDestinationEditing', queryId]);

      if (store.isRowConfiguration()) {
        const isNewQuery = store.isNewQuery(queryId);
        const rowData = rowDataFromQuery(newQuery);
        if (isNewQuery) {
          createConfigRow(configId, rowData, ['isSaving', queryId], diffMsg).then(() => {
            removeFromLocalState(configId, ['editingQueries', queryId]);
            removeFromLocalState(configId, ['newQueries', queryId]);
            removeFromLocalState(configId, ['isSaving', queryId]);
            removeFromLocalState(configId, ['isChanged', queryId]);
          });
        } else {
          updateConfigRow(configId, queryId, rowData, ['isSaving', queryId], diffMsg).then(() => {
            removeFromLocalState(configId, ['editingQueries', queryId]);
            removeFromLocalState(configId, ['isSaving', queryId]);
            removeFromLocalState(configId, ['isChanged', queryId]);
          });
        }
      } else {
        const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
        saveConfigData(configId, newData, ['isSaving', queryId], diffMsg).then(() => {
          removeFromLocalState(configId, ['editingQueries', queryId]);
          removeFromLocalState(configId, ['isSaving', queryId]);
          removeFromLocalState(configId, ['isChanged', queryId]);
          if (store.isNewQuery(queryId)) {
            removeFromLocalState(configId, ['newQueries', queryId]);
          }
        });
      }
    },

    quickstart(configId, tableList) {
      const store = getStore(configId);
      const queries = tableList.map(function(table) {
        let query = store.generateNewQuery(null, componentSupportsSimpleSetup(componentId));
        query = query.set('table', table);
        query = query.set('name', table.get('tableName'));
        const pkCols = getPKColumsFromSourceTable(table, store.getSourceTables(configId));
        if (pkCols.count() > 0) {
          query = query.set('primaryKey', pkCols.map((column) => {
            return column.get('name');
          }).toJS());
        }
        query = query.set('outputTable', store.getDefaultOutputTableId(table.get('tableName')));
        return query;
      });
      const diffMsg = 'Quickstart config creation';
      if (store.isRowConfiguration()) {
        queries.map(function(query) {
          const data = rowDataFromQuery(query);
          createConfigRow(configId, data, ['quickstartSaving', query.get('id')], diffMsg).then(() => {
            removeFromLocalState(configId, ['quickstartSaving', query.get('id')]);
          });
        });
      } else {
        const newData = store.configData.setIn(['parameters', 'tables'], queries);
        saveConfigData(configId, newData, ['quickstartSaving'], diffMsg).then(() => {
          removeFromLocalState(configId, ['quickstartSaving']);
        });
      }
    },

    getDefaultOutputTableId(configId, name) {
      const store = getStore(configId);
      return store.getDefaultOutputTableId(name);
    },

    getPKColumnsFromSourceTable(table, sourceTable) {
      return getPKColumsFromSourceTable(table, sourceTable);
    },

    quickstartSelected(configId, selected) {
      updateLocalState(configId, ['quickstart', 'tables'], selected);
    },

    updateLocalState(configId, path, data) {
      return updateLocalState(configId, path, data);
    },

    getSourceTables(configId) {
      const store = getStore(configId);
      if (store.isConnectionValid()) {
        updateLocalState(configId, storeProvisioning.LOADING_SOURCE_TABLES_PATH, true);
        let runData = store.configData.setIn(['parameters', 'db'], store.getCredentials());
        if (!store.isRowConfiguration()) {
          runData = runData.setIn(['parameters', 'tables'], List());
        }
        const params = {
          configData: runData.toJS()
        };
        return callDockerAction(componentId, 'getTables', params).then(function(data) {
          if (data.status === 'error') {
            updateLocalState(configId, storeProvisioning.SOURCE_TABLES_ERROR_PATH, fromJS(data.message));
          } else if (data.status === 'success') {
            updateLocalState(configId, storeProvisioning.SOURCE_TABLES_ERROR_PATH, null);
          }
          updateLocalState(configId, storeProvisioning.SOURCE_TABLES_PATH, fromJS(data.tables));
          if (store.isRowConfiguration() && data.tables) {
            const candidates = getIncrementalCandidates(fromJS(data.tables));
            updateLocalState(configId, storeProvisioning.INCREMENTAL_CANDIDATES_PATH, candidates);
          }
          updateLocalState(configId, storeProvisioning.LOADING_SOURCE_TABLES_PATH, false);
        });
      }
    },

    migrateConfig(configId) {
      const store = getStore(configId);
      const queries = store.getQueries();
      queries.map((query) => {
        const rowData = rowDataFromQuery(query);
        const diffMsg = 'Migrating query ' + query.get('name') + ' to configuration row';
        updateLocalState(configId, ['migration', 'pending'], true);
        createConfigRow(configId, rowData, ['migration', 'processing', query.get('id').toString()], diffMsg).then(() => {
          removeFromLocalState(configId, ['migration', 'processing', query.get('id').toString()]);
        });
      });
      const newData = store.configData.deleteIn(['parameters', 'tables']);
      const diffMsg = 'Migrating configuration to rows ';
      return saveConfigData(configId, newData, ['migration', 'saving'], diffMsg).then(() => {
        updateLocalState(configId, ['migration', 'pending'], false);
        updateLocalState(configId, ['migration', 'completed'], true);
        if (store.getSourceTables(configId)) {
          const candidates = getIncrementalCandidates(store.getSourceTables(configId));
          updateLocalState(configId, storeProvisioning.INCREMENTAL_CANDIDATES_PATH, candidates);
        }
      });
    },

    dismissMigrationAlert(configId) {
      removeFromLocalState(configId, ['migration']);
    }
  };
}
