import {fromJS, Map} from 'immutable';
import OauthActions from './ActionCreators';
import ApplicationStore from '../../stores/ApplicationStore';
import OauthStore from './Store';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import installedComponentsStore from '../components/stores/InstalledComponentsStore';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import StorageApi from '../components/StorageApi';
import {Constants} from './Constants';

const configOauthPath = ['authorization', 'oauth_api', 'id'];
const configOauthPathVersion = ['authorization', 'oauth_api', 'version'];

function createConfiguration(componentId, configId) {
  const configuration = installedComponentsStore.getConfigData(componentId, configId) || Map();
  return configuration
    .setIn(configOauthPath, configId)
    .setIn(configOauthPathVersion, Constants.OAUTH_VERSION_3);
}

function processRedirectData(componentId, credentialsId) {
  // config component configuration
  return installedComponentsActions.loadComponentConfigData(componentId, credentialsId)
    .then( () => {
      // load credentials for componentId and id
      return OauthActions.loadCredentials(componentId, credentialsId)
        .then(() => {
          const credentials = OauthStore.getCredentials(componentId, credentialsId);
          const newConfiguration = createConfiguration(componentId, credentialsId);

          // save configuration with authorization id
          const saveFn = installedComponentsActions.saveComponentConfigData;
          const authorizedFor = credentials.get('authorizedFor');
          return saveFn(componentId, credentialsId, fromJS(newConfiguration), `Save authorization for ${authorizedFor}`).then(() => authorizedFor);
        });
    });
}

function redirectToPath(path, params) {
  const router = RoutesStore.getRouter();
  router.transitionTo(path, params);
}

function sendNotification(message, type = 'success') {
  const notification = {
    message: message,
    type: type
  };
  ApplicationActionCreators.sendNotification(notification);
}

// create a router route that is redirection from oauth process
// counts on having configIf as config parameter in route params
// @routeName - redirection route name eg 'ex-dropbox-redirect'
// @redirectPathName - path to the route to redirect after success
// process eg. 'ex-dropbox-index'
// @redirectParamsFn - function takes params and returns params for
// redirection to @redirectPathName e.g (params) -> params.config
// @componentId - componentId
export function createRedirectRoute(routeName, redirectPathName, redirectParamsFn, componentId) {
  return {
    name: routeName,
    path: 'oauth-redirect',
    title: 'Authorizing...',
    requireData: [
      (params) => {
        const configId = params.config;
        const cid = componentId || params.component;
        processRedirectData(cid, configId)
          .then((authorizedFor) => {
            const msg = `Account succesfully authorized for ${authorizedFor}`;
            sendNotification(msg);
            redirectToPath(redirectPathName, redirectParamsFn(params));
          });
      }                                                        ]
  };
}

// simplified wrapper of createRedirectRoute(^^) that takes only componentId
// the route must accept config param - :config path in the parent route
export function createRedirectRouteSimple(componentId) {
  return createRedirectRoute(
    componentId + '-oauth-redirect',
    componentId,
    (params) => {
      return {
        component: componentId,
        config: params.config
      };
    },
    componentId
  );
}

// get credentials id from configData and load credentials
export function loadCredentialsFromConfig(componentId, configId) {
  const configuration = installedComponentsStore.getConfigData(componentId, configId);
  const id = configuration.getIn(configOauthPath);
  const version = configuration.getIn(configOauthPathVersion, Constants.OAUTH_VERSION_FALLBACK);

  if (id) {
    return OauthActions.loadCredentials(componentId, id, version);
  }
}

// delete credentials and docker configuration object part
export function deleteCredentialsAndConfigAuth(componentId, configId) {
  const configData = installedComponentsStore.getConfigData(componentId, configId);
  const credentialsId = configData.getIn(configOauthPath);
  const version = configData.getIn(configOauthPathVersion, Constants.OAUTH_VERSION_FALLBACK);
  const credentials = OauthStore.getCredentials(componentId, credentialsId, version);
  const authorizedFor = credentials.get('authorizedFor');
  return OauthActions.deleteCredentials(componentId, credentialsId, version)
    .then(() => {
      // delete the whole authorization object part of the configuration
      const newConfigData = configData.deleteIn([].concat(configOauthPath[0]));
      const description = `Reset authorization of ${authorizedFor}`;
      return installedComponentsActions.saveComponentConfigData(componentId, configId, newConfigData, description);
    })
    .then(() => {
      return installedComponentsActions.loadComponentConfigDataForce(componentId, configId);
    });
}

export function getCredentialsId(configData) {
  return configData.getIn(configOauthPath);
}

export function getCredentials(componentId, configId) {
  return OauthStore.getCredentials(componentId, configId);
}

export function generateLink(componentId, configId) {
  const description = ApplicationStore.getSapiToken().get('description');
  const tokenParams = {
    canManageBuckets: false,
    canReadAllFileUploads: false,
    componentAccess: [componentId],
    description: `${description} external oauth link`,
    expiresIn: (48 * 3600) // 48 hours in seconds
  };
  const externalAppUrl = 'https://external.keboola.com/oauth/index.html';
  return StorageApi.createToken(tokenParams)
    .then((token) => {
      return `${externalAppUrl}?token=${token.token}&sapiUrl=${ApplicationStore.getSapiUrl()}#/${componentId}/${configId}`;
    });
}

export function saveDirectData(componentId, configId, authorizedFor, data) {
  return OauthActions.postCredentials(componentId, configId, authorizedFor, data)
    .then(() => {
      const newConfiguration = createConfiguration(componentId, configId);

      // save configuration with authorization id
      const saveFn = installedComponentsActions.saveComponentConfigData;
      return saveFn(componentId, configId, fromJS(newConfiguration), `Save direct token authorization for ${authorizedFor}`).then(() => authorizedFor);
    });
}

export function linkCredentials(componentId, configId, credentials) {
  const description = `Link credentials for ${credentials.get('authorizedFor')}`;
  const newConfiguration = installedComponentsStore
    .getConfigData(componentId, configId)
    .setIn(['authorization', 'oauth_api', 'id'], credentials.get('id'))
    .setIn(['authorization', 'oauth_api', 'version'], Constants.OAUTH_VERSION_FALLBACK);
  
  return installedComponentsActions.saveComponentConfigData(componentId, configId, newConfiguration, description);
}