import {List, Map} from 'immutable';
import {getDefaultBucket} from './common';
import _ from 'underscore';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import OauthStore from '../oauth-v2/Store';

const COMPONENT_ID = 'keboola.ex-google-drive';

export const storeMixins = [InstalledComponentStore, OauthStore];

export default function(configId) {
  const localState = () => InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const oauthCredentialsId = configData.getIn(['authorization', 'oauth_api', 'id']);

  const parameters = configData.get('parameters', Map());
  const sheets = parameters.getIn(['sheets'], List()).sortBy((s) => s.get('fileTitle').toLowerCase());
  const processors = configData.getIn(['processors', 'after'], List());

  const tempPath = ['_'];
  const savingPath = tempPath.concat('saving');
  const pendingPath = tempPath.concat('pending');
  const defaultOutputBucket = getDefaultBucket(COMPONENT_ID, configId);
  const outputBucket = parameters.get('outputBucket') || defaultOutputBucket;

  function getConfigSheet(sheetId) {
    return sheets.find((q) => q.get('id').toString() === sheetId.toString());
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
    sheets: sheets,
    processors: processors,
    configData: configData,
    outputBucket: outputBucket,

    isSaving(what) {
      return localState().getIn(savingPath.concat(what), false);
    },

    getSavingPath(what) {
      return savingPath.concat(what);
    },

    getConfigSheet: getConfigSheet,


    getPendingPath(what) {
      return pendingPath.concat(what);
    },

    isPending(what) {
      return localState().getIn(pendingPath.concat(what), null);
    },

    getRunSingleSheetData(sheetId) {
      const sheet = getConfigSheet(sheetId).set('enabled', true);
      return configData.setIn(['parameters', 'sheets'], List().push(sheet)).toJS();
    },

    isAuthorized() {
      const creds = this.oauthCredentials;
      return creds && creds.has('id');
    }

  };
}
