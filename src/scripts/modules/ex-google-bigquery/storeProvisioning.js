import {List, Map} from 'immutable';
import _ from 'underscore';
import fuzzy from 'fuzzy';
import string from '../../utils/string';
import generateId from '../../utils/generateId';

import {getDefaultBucket} from './common';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import OauthStore from '../oauth-v2/Store';

import { DatasetLocations } from './constants';
const COMPONENT_ID = 'keboola.ex-google-bigquery';

export const storeMixins = [InstalledComponentStore, OauthStore];

export default function(configId) {
  const localState = () => InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const oauthCredentialsId = configData.getIn(['authorization', 'oauth_api', 'id']);

  const parameters = configData.get('parameters', Map());
  const queries = parameters.getIn(['queries'], List()).map((q) => q.has('useLegacySql') ? q : q.set('useLegacySql', true));

  const tempPath = ['_'];
  const savingPath = tempPath.concat('saving');
  const editingQueriesPath = tempPath.concat('editingQueries');
  const newQueryPath = tempPath.concat('newQuery');
  const projectsPath = tempPath.concat('projects');
  const googlePath = tempPath.concat('google');
  const pendingPath = tempPath.concat('pending');
  const defaultOutputBucket = getDefaultBucket(COMPONENT_ID, configId);
  const outputBucket = parameters.get('outputBucket') || defaultOutputBucket;

  const filter = localState().get('filter', '');
  const queriesFiltered = queries.filter((q) => {
    return fuzzy.match(filter, q.get('name'));
  });

  function getConfigQuery(queryId) {
    return queries.find((q) => q.get('id').toString() === queryId.toString());
  }

  function createNewGoogle() {
    return Map({ projectId: '', storage: '', location: DatasetLocations.MULTI_REGION_US});
  }

  function createNewQuery() {
    const ids = queries.map((q) => q.get('id')).toJS();

    return Map({
      id: generateId(ids),
      name: '',
      query: '',
      flattenResults: true, // non editable yet
      outputTable: '',
      enabled: true,
      incremental: false,
      useLegacySql: true,
      primaryKey: List()
    });
  }

  return {
    oauthCredentials: OauthStore.getCredentials(COMPONENT_ID, oauthCredentialsId) || Map(),
    oauthCredentialsId: oauthCredentialsId || configId,

    // local state stuff
    getLocalState(path) {
      if (_.isEmpty(path)) {
        return localState() || Map();
      }
      return localState().getIn([].concat(path), Map());
    },


    // config data stuff
    projects: localState().getIn(projectsPath, List()),
    queries: queries,
    google: parameters.getIn(['google'], Map()),
    configData: configData,
    outputBucket: outputBucket,
    defaultNewQuery: createNewQuery(),
    defaultGoogle: createNewGoogle(),
    filter: filter,
    queriesFiltered: queriesFiltered,
    hasCredentials: !!oauthCredentialsId,

    isSaving(what) {
      return localState().getIn(savingPath.concat(what), false);
    },

    isSavingQuery(queryId) {
      return localState().getIn(this.getSavingPath(['queries', queryId]), false);
    },

    isQueryValid(query) {
      return query && !!query.get('name') && !!query.get('query');
    },

    getSavingPath(what) {
      return savingPath.concat(what);
    },
    getConfigQuery: getConfigQuery,

    getProjectsPath() {
      return projectsPath;
    },

    getGooglePath() {
      return googlePath;
    },

    getNewQueryPath() {
      return newQueryPath;
    },

    getNewQuery() {
      return localState().getIn(newQueryPath, createNewQuery());
    },

    getEditingGoogle() {
      return localState().getIn(googlePath, createNewGoogle());
    },

    resetNewQuery() {
      return localState().setIn(newQueryPath, createNewQuery());
    },

    getEditingQueryPath(queryId) {
      return editingQueriesPath.concat(queryId.toString());
    },

    getEditingQuery(queryId) {
      return localState().getIn(this.getEditingQueryPath(queryId), null);
    },

    getPendingPath(what) {
      return pendingPath.concat(what);
    },

    isPending(what) {
      return localState().getIn(pendingPath.concat(what), null);
    },

    getRunSingleQueryData(queryId) {
      const query = getConfigQuery(queryId).set('enabled', true);
      return configData.setIn(['parameters', 'queries'], List().push(query)).toJS();
    },

    isAuthorized() {
      const creds = this.oauthCredentials;
      return creds && creds.has('id');
    },

    getDefaultOutputTableId(query) {
      if (!query) {return ''; }
      const qname = string.sanitizeKbcTableIdString(query.get('name', ''));
      const bucketName = string.sanitizeKbcTableIdString(COMPONENT_ID);
      return `in.c-${bucketName}.${qname}`;
    }

  };
}
