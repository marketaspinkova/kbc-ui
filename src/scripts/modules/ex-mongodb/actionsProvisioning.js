import * as storeProvisioning from './storeProvisioning';
import {Map, List} from 'immutable';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';
import RoutesStore from '../../stores/RoutesStore';

import {getProtectedProperties} from './credentials';

export function loadConfiguration(componentId, configId) {
  return componentsActions.loadComponentConfigData(componentId, configId);
}

export function createActions(componentId) {
  function updateProtectedProperties(newCredentials, oldCredentials) {
    const props = getProtectedProperties();
    let result = newCredentials;
    for (let prop of props) {
      const newValue = newCredentials.get(prop);
      const oldValue = oldCredentials.get(prop);
      if (!newValue) {
        result = result.set(prop, oldValue);
      }
    }
    return result;
  }

  function getStore(configId) {
    return storeProvisioning.createStore(componentId, configId);
  }

  function localState(configId) {
    return storeProvisioning.getLocalState(componentId, configId);
  }

  function updateLocalState(configId, path, data) {
    const ls = localState(configId);
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function removeFromLocalState(configId, path) {
    const ls = localState(configId);
    const newLocalState = ls.deleteIn([].concat(path));
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function saveConfigData(configId, data, waitingPath) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.saveComponentConfigData(componentId, configId, data)
      .then(() => updateLocalState(configId, waitingPath, false));
  }

  return {
    setQueriesFilter(configId, query) {
      updateLocalState(configId, 'queriesFilter', query);
    },

    cancelCredentialsEdit(configId) {
      removeFromLocalState(configId, ['isChangedCredentials'], null);
      removeFromLocalState(configId, ['editingCredentials'], null);
    },

    updateEditingCredentials(configId, newCredentials) {
      updateLocalState(configId, 'editingCredentials', newCredentials);
      if (!localState(configId).get('isChangedCredentials', false)) {
        updateLocalState(configId, ['isChangedCredentials'], true);
      }
    },

    resetNewQuery(configId) {
      updateLocalState(configId, ['newQueries'], Map());
    },

    changeQueryEnabledState(configId, qid, newValue) {
      const store = getStore(configId);
      const newQueries = store.getQueries().map((q) => {
        if (q.get('id') === qid) {
          return q.set('enabled', newValue);
        } else {
          return q;
        }
      });
      const newData = store.configData.setIn(['parameters', 'exports'], newQueries);
      return saveConfigData(configId, newData, ['pending', qid, 'enabled']);
    },

    resetNewCredentials(configId) {
      updateLocalState(configId, ['newCredentials'], null);
    },

    saveNewCredentials(configId) {
      const store = getStore(configId);
      let newCredentials = store.getNewCredentials();
      newCredentials = updateProtectedProperties(newCredentials, store.getCredentials());
      const newData = store.configData.setIn(['parameters', 'db'], newCredentials);
      return saveConfigData(configId, newData, ['isSavingCredentials']).then(() => {
        this.resetNewCredentials(configId);
        RoutesStore.getRouter().transitionTo(componentId, {config: configId});
      });
    },

    prepareQueryToSave(query) {
      let newQuery = query;

      const mode = newQuery.get('mode', 'mapping');

      if (mode === 'mapping') {
        const mapping = newQuery.get('mapping');
        if (Map.isMap(mapping)) {
          newQuery = newQuery.set('mapping', mapping.toJS());
        } else {
          newQuery = newQuery.set('mapping', JSON.parse(mapping));
        }
      } else {
        newQuery = newQuery.delete('mapping');
      }
      return newQuery;
    },

    createNewQuery(configId) {
      const store = getStore(configId);
      let newQuery = store.getNewQuery();
      updateLocalState(configId, ['newQueries', newQuery.get('id')], newQuery);
      updateLocalState(configId, ['newQueriesIdsList'], store.getNewQueriesIdsList().unshift(newQuery.get('id')));
      updateLocalState(configId, ['editingQueries', newQuery.get('id')], newQuery);
      return newQuery;
    },

    createQuery(configId) {
      const store = getStore(configId);
      let newQuery = store.getNewQuery();

      newQuery = this.prepareQueryToSave(newQuery);

      const newQueries = store.getQueries().push(newQuery);
      const newData = store.configData.setIn(['parameters', 'exports'], newQueries);
      return saveConfigData(configId, newData, ['newQueries', 'isSaving'])
        .then(() => this.resetNewQuery(configId));
    },

    saveCredentialsEdit(configId) {
      const store = getStore(configId);
      let credentials = store.getEditingCredentials();
      credentials = updateProtectedProperties(credentials, store.getCredentials());
      const newConfigData = store.configData.setIn(['parameters', 'db'], credentials);
      return saveConfigData(configId, newConfigData, 'isSavingCredentials')
        .then(() => {
          this.cancelCredentialsEdit(configId);
          RoutesStore.getRouter().transitionTo(componentId, {config: configId});
        });
    },

    deleteQuery(configId, qid) {
      const store = getStore(configId);
      const newQueries = store.getQueries().filter((q) => q.get('id') !== qid);
      const newData = store.configData.setIn(['parameters', 'exports'], newQueries);
      return saveConfigData(configId, newData, ['pending', qid, 'deleteQuery']);
    },

    updateEditingQuery(configId, query) {
      const queryId = query.get('id');
      updateLocalState(configId, ['editingQueries', queryId], query);
      if (!localState(configId).getIn(['isChanged', queryId], false)) {
        updateLocalState(configId, ['isChanged', queryId], true);
      }
    },

    cancelQueryEdit(configId, queryId) {
      removeFromLocalState(configId, ['editingQueries', queryId]);
    },

    resetQueryEdit(configId, queryId) {
      removeFromLocalState(configId, ['isChanged', queryId]);
      const store = getStore(configId);
      if (store.isNewQuery(queryId)) {
        const newQuery = store.getNewQuery(queryId);
        updateLocalState(configId, ['newQueries', queryId], newQuery);
        updateLocalState(configId, ['editingQueries', queryId], newQuery);
      } else {
        removeFromLocalState(configId, ['editingQueries', queryId]);
      }
    },

    saveQueryEdit(configId, queryId) {
      const store = getStore(configId);
      let newQuery = store.getEditingQuery(queryId);
      let newQueries = store.getQueries().filter( (q) => q.get('id') !== newQuery.get('id'));

      newQuery = this.prepareQueryToSave(newQuery);

      newQueries = newQueries.push(newQuery);
      const newData = store.configData.setIn(['parameters', 'exports'], newQueries);
      return saveConfigData(configId, newData, ['isSaving', queryId]).then(() => {
        this.cancelQueryEdit(configId, queryId);
        removeFromLocalState(configId, ['isSaving', queryId]);
        removeFromLocalState(configId, ['isChanged', queryId]);
        if (store.isNewQuery(queryId)) {
          removeFromLocalState(configId, ['newQueries', queryId]);
        }
      });
    },

    testCredentials(configId, credentials) {
      const store = getStore(configId);
      const testingCredentials = updateProtectedProperties(credentials, store.getCredentials());
      let runData = store.configData.setIn(['parameters', 'exports'], List());
      runData = runData.setIn(['parameters', 'db'], testingCredentials);
      const params = {
        configData: runData.toJS()
      };
      return callDockerAction(componentId, 'testConnection', params);
    },

    prepareSingleQueryRunData(configId, query) {
      const store = getStore(configId);
      const runData = store.configData.setIn(['parameters', 'exports'], List().push(query));
      return runData;
    }
  };
}
