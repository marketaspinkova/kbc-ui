import {List, Map} from 'immutable';
import fuzzy from 'fuzzy';

import {getDefaultBucket} from './common';
import _ from 'underscore';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import OauthStore from '../oauth-v2/Store';

const defaultNewQuery = Map({
  name: '',
  enabled: true,
  outputTable: null,
  query: Map({
    dateRanges: List([Map({
      startDate: '-4 days',
      endDate: 'today'
    })])
  })
});

export const storeMixins = [InstalledComponentStore, OauthStore];

export default function(configId, componentId) {
  const localState = () => InstalledComponentStore.getLocalState(componentId, configId) || Map();
  const configData =  InstalledComponentStore.getConfigData(componentId, configId) || Map();
  const oauthCredentialsId = configData.getIn(['authorization', 'oauth_api', 'id']);

  const parameters = configData.get('parameters', Map());
  const queries = parameters.getIn(['queries'], List());

  const tempPath = ['_'];
  const savingPath = tempPath.concat('saving');
  const editingQueriesPath = tempPath.concat('editingQueries');
  const newQueryPath = tempPath.concat('newQuery');
  const pendingPath = tempPath.concat('pending');
  const accountSegmentsPath = tempPath.concat(['segments', oauthCredentialsId]);
  const defaultOutputBucket = getDefaultBucket(componentId, configId);
  const outputBucket = parameters.get('outputBucket') || defaultOutputBucket;

  const filter = localState().get('filter', '');
  const queriesFiltered = queries.filter((q) => {
    return fuzzy.match(filter, q.get('name'));
  });

  function getConfigQuery(queryId) {
    return queries.find((q) => q.get('id').toString() === queryId.toString());
  }

  return {
    oauthCredentials: OauthStore.getCredentials(componentId, oauthCredentialsId) || Map(),
    oauthCredentialsId: oauthCredentialsId || configId,

    // local state stuff
    getLocalState(path) {
      if (_.isEmpty(path)) {
        return localState() || Map();
      }
      return localState().getIn([].concat(path), Map());
    },

    accountSegments: localState().getIn(accountSegmentsPath, Map()),

    // config data stuff
    queries: queries,
    antisampling: parameters.get('antisampling', null),
    profiles: parameters.getIn(['profiles'], List()),
    configData: configData,
    outputBucket: outputBucket,
    defaultNewQuery: defaultNewQuery,
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
      return query && query.getIn(['query', 'metrics'], List()).count() > 0 &&
        query.getIn(['query', 'dimensions'], List()).count() > 0 &&
        !!query.get('name');
    },

    getSavingPath(what) {
      return savingPath.concat(what);
    },
    getConfigQuery: getConfigQuery,

    getNewQueryPath() {
      return newQueryPath;
    },

    getNewQuery() {
      return localState().getIn(newQueryPath, defaultNewQuery);
    },

    getEditingQueryPath(queryId) {
      return editingQueriesPath.concat(queryId);
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

    getSampleDataInfoPath(queryId) {
      return tempPath.concat(['sampleData', queryId || 'NewQuery']);
    },

    getSampleDataInfo(queryId) {
      return localState().getIn(this.getSampleDataInfoPath(queryId), Map());
    },

    getRunSingleQueryData(queryId) {
      const query = getConfigQuery(queryId).set('enabled', true);
      return configData.setIn(['parameters', 'queries'], List().push(query)).toJS();
    },

    getAccountSegmentsPath() {
      return accountSegmentsPath;
    },

    isAuthorized() {
      const creds = this.oauthCredentials;
      return creds && creds.has('id');
    }

  };
}
