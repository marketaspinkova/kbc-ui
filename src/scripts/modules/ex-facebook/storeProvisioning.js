import {Map, List} from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import _ from 'underscore';
import OauthStore from '../oauth-v2/Store';


export const storeMixins = [InstalledComponentStore, OauthStore];

const DEFAULT_VERSIONS_MAP = {
  'keboola.ex-instagram': 'v3.2',
  'keboola.ex-facebook-ads': 'v3.2',
  'keboola.ex-facebook': 'v3.2'
};

const DEFAULT_BACKEND_VERSION = 'v3.2';

export default function(COMPONENT_ID, configId) {
  const DEFAULT_API_VERSION = DEFAULT_VERSIONS_MAP[COMPONENT_ID];
  const localState = () => InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const oauthCredentialsId = configData.getIn(['authorization', 'oauth_api', 'id']);
  const parameters = configData.get('parameters', Map());
  const queries = parameters.get('queries', List());

  const tempPath = ['_'];
  const syncAccountsPath = tempPath.concat('SyncAccounts');
  const accountsSavingPath = tempPath.concat('savingaccounts');
  const savingQueriesPath = tempPath.concat('savingQueries');
  const pendingPath = tempPath.concat('pending');

  const editPath = tempPath.concat('editing');
  const editData = localState().getIn(editPath, Map());

  function findQuery(qid) {
    return queries.findLast((q) => q.get('id') === qid);
  }

  // ----ACTUAL STATE OBJECT------
  return {
    DEFAULT_API_VERSION: DEFAULT_API_VERSION,
    oauthCredentials: OauthStore.getCredentials(COMPONENT_ID, oauthCredentialsId) || Map(),
    oauthCredentialsId: oauthCredentialsId || configId,

    // local state stuff
    getLocalState(path) {
      if (_.isEmpty(path)) {
        return localState() || Map();
      }
      return localState().getIn([].concat(path), Map());
    },
    findQuery: findQuery,
    syncAccountsPath: syncAccountsPath,
    syncAccounts: localState().getIn(syncAccountsPath, Map()),
    configData: configData,
    parameters: parameters,
    queries: queries,
    hasQueries: queries.count() > 0,
    version: parameters.get('api-version', DEFAULT_BACKEND_VERSION),
    accounts: parameters.get('accounts', Map()),
    hasAccounts: parameters.get('accounts', Map()).count() > 0,
    getEditPath: (what) => what ? editPath.concat(what) : editPath,
    isEditing: (what) => editData.hasIn([].concat(what)),
    editData: editData,
    isSavingAccounts: () => localState().getIn(accountsSavingPath),
    isSavingQuery: (qid) => localState().getIn(savingQueriesPath.concat(qid), false),
    getSavingQueryPath: (qid) => savingQueriesPath.concat(qid),

    getPendingPath(what) {
      return pendingPath.concat(what);
    },

    isPending(what) {
      return localState().getIn(pendingPath.concat(what), null);
    },

    getRunSingleQueryData(qid) {
      const query = findQuery(qid).set('disabled', false);
      return configData.setIn(['parameters', 'queries'], List().push(query)).toJS();
    },

    accountsSavingPath,
    isAuthorized() {
      const creds = this.oauthCredentials;
      return creds && creds.has('id');
    }
  };
}
