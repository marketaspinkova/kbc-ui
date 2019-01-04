import storeProvisioning from './storeProvisioning';
import {Map, fromJS} from 'immutable';
import * as common from './common';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';
import _ from 'underscore';
import Promise from 'bluebird';

export default function(configId, componentId) {
  const store = storeProvisioning(configId, componentId);

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    let dataToSave = data;
    // check default output bucket and save default if non set
    const ob = dataToSave.getIn(['parameters', 'outputBucket']);
    if (!ob) {
      dataToSave = dataToSave.setIn(['parameters', 'outputBucket'], common.getDefaultBucket(componentId, configId));
    }

    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(componentId, configId, dataToSave, changeDescription)
      .then(() => updateLocalState(waitingPath, false));
  }


  // returns localState for @path and function to update local state
  // on @path+@subPath
  function prepareLocalState(path) {
    const ls = store.getLocalState(path);
    const updateLocalSubstateFn = (subPath, newData)  =>  {
      if (_.isEmpty(subPath)) {
        return updateLocalState([].concat(path), newData);
      } else {
        return updateLocalState([].concat(path).concat(subPath), newData);
      }
    };
    return {
      localState: ls,
      updateLocalState: updateLocalSubstateFn,
      prepareLocalState: (newSubPath) => prepareLocalState([].concat(path).concat(newSubPath))
    };
  }

  function generateId() {
    const existingIds = store.queries.map((q) => q.get('id'));
    const randomNumber = () => Math.floor((Math.random() * 100000) + 1);
    let newId = randomNumber();
    while (existingIds.indexOf(newId) >= 0) {
      newId = randomNumber();
    }
    return newId;
  }

  function saveQueries(newQueries, savingPath, changeDescription) {
    const msg = changeDescription || 'Update queries';
    const data = store.configData.setIn(['parameters', 'queries'], newQueries);
    return saveConfigData(data, savingPath, msg);
  }


  return {
    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,
    saveProfiles(newProfiles) {
      const waitingPath = store.getSavingPath('profiles');
      const newData = store.configData.setIn(['parameters', 'profiles'], newProfiles);
      return saveConfigData(newData, waitingPath, 'Update profiles');
    },

    onChangeEditingQueryFn(queryId) {
      const path = store.getEditingQueryPath(queryId);
      return (newQuery) => updateLocalState(path, newQuery);
    },

    onUpdateNewQuery(newQuery) {
      const path = store.getNewQueryPath();
      return updateLocalState(path, newQuery);
    },

    startEditingQuery(queryId) {
      const path = store.getEditingQueryPath(queryId);
      const query = store.getConfigQuery(queryId);
      updateLocalState(path, query);
    },

    saveNewQuery() {
      let newQuery = store.getNewQuery().set('id', generateId());
      if (!newQuery.get('outputTable')) {
        const name = newQuery.get('name');
        newQuery = newQuery.set('outputTable', common.sanitizeTableName(name));
      }
      const queries = store.queries.push(newQuery);
      const data = store.configData.setIn(['parameters', 'queries'], queries);
      const savingPath = store.getSavingPath(['newQuery']);
      return saveConfigData(data, savingPath, `Create query ${newQuery.get('name')}`);
    },

    resetNewQuerySampleDataInfo() {
      const path = store.getSampleDataInfoPath('NewQuery');
      updateLocalState(path, Map());
    },

    cancelEditingNewQuery() {
      const path = store.getNewQueryPath();
      return updateLocalState(path, store.defaultNewQuery);
    },

    saveAntisampling(newVal) {
      const data = store.configData.setIn(['parameters', 'antisampling'], newVal);
      const savingPath = store.getSavingPath(['antisampling']);
      return saveConfigData(data, savingPath, `Set antisampling to ${newVal || 'None'}`);
    },

    saveEditingQuery(queryId) {
      let query = store.getEditingQuery(queryId);
      const msg = `Update query ${query.get('name')}`;
      if (!query.get('outputTable')) {
        const name = query.get('name');
        query = query.set('outputTable', common.sanitizeTableName(name));
      }
      const queries = store.queries.map((q) => q.get('id').toString() === queryId.toString() ? query : q);
      const data = store.configData.setIn(['parameters', 'queries'], queries);
      const savingPath = store.getSavingPath(['queries', queryId]);
      return saveConfigData(data, savingPath, msg).then(() => this.cancelEditingQuery(queryId));
    },

    cancelEditingQuery(queryId) {
      const path = store.getEditingQueryPath(queryId);
      updateLocalState(path, null);
    },

    deleteQuery(queryId) {
      const newQueries = store.queries.filter((q) => q.get('id').toString() !== queryId.toString());
      const msg = `Remove query ${store.getConfigQuery(queryId).get('name')}`;
      return saveQueries(newQueries, store.getPendingPath(['delete', queryId]), msg);
    },

    toggleQueryEnabled(queryId) {
      let newQuery = store.getConfigQuery(queryId);
      const msg = `${newQuery.get('enabled') ? 'Disable' : 'Enable'} query ${newQuery.get('name')}`;
      newQuery = newQuery.set('enabled', !newQuery.get('enabled'));
      const newQueries = store.queries.map((q) => q.get('id').toString() === queryId.toString() ? newQuery : q);
      return saveQueries(newQueries, store.getPendingPath(['toggle', queryId]), msg);
    },

    setQueriesFilter(newFilter) {
      return updateLocalState('filter', newFilter);
    },

    runQuerySample(query, queryId) {
      const path = store.getSampleDataInfoPath(queryId);
      let queryRequest = query.set('id', 0);
      if (!queryRequest.get('outputTable')) {
        queryRequest = queryRequest.set('outputTable', common.sanitizeTableName(queryRequest.get('name')));
      }
      const queries = [queryRequest];
      const data = store.configData
        .setIn(['parameters', 'queries'], queries)
        .setIn(['parameters', 'outputBucket'], store.outputBucket);
      const params = {
        configData: data.toJS()
      };

      updateLocalState(path.concat('isLoading'), true);
      return callDockerAction(componentId, 'sampleJson', params)
        .then((result) => {
          if (result.status !== 'success') {
            throw result;
          }
          if (result && result.data.length === 0) {
            return Promise.resolve([]);
          }
          return Promise.resolve(result.data);
        })
        .then((jsonData) =>
          updateLocalState(path, fromJS({
            isLoading: false,
            isError: false,
            error: null,
            data: jsonData
          })))
        .catch((error) =>
          updateLocalState(path, fromJS({
            isLoading: false,
            isError: true,
            error: error,
            data: null
          })));
    },

    loadAccountSegments() {
      if (!store.isAuthorized()) return null;
      const path = store.getAccountSegmentsPath();
      const segments = store.accountSegments;
      if (segments.count() > 0) return null;
      const data = store.configData;
      const params = {
        configData: data.toJS()
      };
      updateLocalState(path.concat('isLoading'), true);
      return callDockerAction(componentId, 'segments', params)
        .then((result) => {
          if (result.status !== 'success') {
            throw result;
          }
          return result.data.map((s) => {
            const attrs = {
              group: s.type,
              uiName: s.name,
              id: s.segmentId,
              description: ''
            };
            s.attributes = attrs;
            s.id = s.segmentId;
            return s;
          });
        })
        .then((segmentsData) =>
          updateLocalState(path, fromJS({
            isLoading: false,
            isError: false,
            error: null,
            data: segmentsData
          })))
        .catch((error) =>
          updateLocalState(path, fromJS({
            isLoading: false,
            isError: true,
            error: error,
            data: []
          })));
    }
  };
}
