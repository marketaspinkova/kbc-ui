import _ from 'underscore';
import Promise from 'bluebird';
import {Map, fromJS} from 'immutable';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';
import storeProvisioning from './storeProvisioning';
import SyncActionError from '../../utils/errors/SyncActionError';

const COMPONENT_ID = 'keboola.ex-google-bigquery';

/*
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func.isRequired,
  prepareLocalState: PropTypes.func.isRequired
*/
export default function(configId) {
  const store = storeProvisioning(configId);

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState);
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription)
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

  return {
    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,

    setQueriesFilter(filter) {
      return updateLocalState('filter', filter);
    },

    onUpdateNewQuery(newQuery) {
      const path = store.getNewQueryPath();
      return updateLocalState(path, newQuery);
    },

    cancelEditingNewQuery() {
      const path = store.getNewQueryPath();
      return updateLocalState(path, store.defaultNewQuery);
    },

    saveNewQuery() {
      let newQuery = store.getNewQuery();
      if (newQuery.get('outputTable', '').trim().length === 0) {
        newQuery = newQuery.set('outputTable', store.getDefaultOutputTableId(newQuery));
      }
      const queries = store.queries.push(newQuery);
      const data = store.configData.setIn(['parameters', 'queries'], queries);
      return saveConfigData(data, store.getPendingPath(['newQuery']), `Create query ${newQuery.get('name')}`);
    },

    deleteQuery(qid) {
      const newQueries = store.queries.filter((q) => q.get('id').toString() !== qid.toString());
      const newData = store.configData.setIn(['parameters', 'queries'], newQueries);
      const diffMsg = 'Delete query ' + store.getConfigQuery(qid).get('name');

      return saveConfigData(newData, store.getPendingPath(['deleteQuery', qid]), diffMsg);
    },

    changeQueryEnabledState(qid) {
      const newValue = !store.getConfigQuery(qid).get('enabled', false);
      const newQueries = store.queries.map((q) => {
        if (q.get('id').toString() === qid.toString()) {
          return q.set('enabled', newValue);
        } else {
          return q;
        }
      });
      const prefixMsg = !!newValue ? 'Enable' : 'Disable';
      const diffMsg = prefixMsg + ' query ' + store.getConfigQuery(qid).get('name');
      const newData = store.configData.setIn(['parameters', 'queries'], newQueries);

      return saveConfigData(newData, store.getPendingPath(['toggleQuery', qid]), diffMsg);
    },

    startEditingQuery(queryId) {
      const path = store.getEditingQueryPath(queryId);
      const query = store.getConfigQuery(queryId);
      updateLocalState(path, query);
    },

    cancelEditingQuery(queryId) {
      const path = store.getEditingQueryPath(queryId);
      updateLocalState(path, null);
    },

    onUpdateEditingQuery(query) {
      const path = store.getEditingQueryPath(query.get('id'));
      return updateLocalState(path, query);
    },

    startEditingGoogle() {
      const path = store.getGooglePath();
      const google = store.configData.getIn(['parameters', 'google'], Map());
      updateLocalState(path, google);
    },

    cancelEditingGoogle() {
      const path = store.getGooglePath();
      updateLocalState(path, store.defaultGoogle);
    },

    onUpdateEditingGoogle(google) {
      const path = store.getGooglePath();
      return updateLocalState(path, google);
    },

    saveEditingQuery(queryId) {
      let query = store.getEditingQuery(queryId);
      const msg = `Update query ${query.get('name')}`;
      if (!query.get('outputTable')) {
        query = query.set('outputTable', store.getDefaultOutputTableId(query));
      }

      const queries = store.queries.map((q) => q.get('id').toString() === queryId.toString() ? query : q);
      const data = store.configData.setIn(['parameters', 'queries'], queries);
      const savingPath = store.getSavingPath(['queries', queryId]);
      return saveConfigData(data, savingPath, msg).then(() => this.cancelEditingQuery(queryId));
    },

    resetGoogle() {
      const data = store.configData.setIn(['parameters', 'google'], store.defaultGoogle);
      return saveConfigData(data, store.getPendingPath(['projectId']), 'Reset Google configuration').then(() => this.cancelEditingGoogle());
    },

    saveGoogle(google) {
      const data = store.configData.setIn(['parameters', 'google'], google);
      return saveConfigData(data, store.getPendingPath(['projectId']), 'Update Google configuration').then(() => this.cancelEditingGoogle());
    },

    loadAccountProjects() {
      if (!store.isAuthorized() || store.projects.count() > 0) {
        return Promise.resolve();
      }

      updateLocalState(store.getPendingPath('projects'), true);

      const params = {
        configData: {
          authorization: store.configData.get('authorization').toJS(),
          parameters: {
            google: {
              projectId: 123,
              storage: '123'
            }
          }
        }
      };

      return callDockerAction(COMPONENT_ID, 'listProjects', params)
        .then((result) => {
          if (result.status === 'error') {
            throw new SyncActionError(result.message || 'There was an error while loading projects list');
          }
          return result.projects;
        })
        .then((projects) => {
          return updateLocalState(store.getProjectsPath(), fromJS(projects));
        })
        .finally(() => {
          updateLocalState(store.getPendingPath('projects'), false);
        });
    }
  };
}
