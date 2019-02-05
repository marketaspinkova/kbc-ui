import Immutable from 'immutable';

const OAUTH_FALLBACK_VERSION = 2;

const OAUTH_V3 = 3;

const createConfiguration = function(localState) {
  const config = Immutable.fromJS({
    authorization: {
      oauth_api: {
        id: localState.get('oauthId', '')
      }
    }
  });

  if (localState.has('oauthVersion') && localState.get('oauthVersion') === OAUTH_V3) {
    return config.setIn(['authorization', 'oauth_api', 'version'], OAUTH_V3);
  }

  return config;
};

const parseConfiguration = function(configuration, context) {
  return Immutable.fromJS({
    oauthId: configuration.getIn(['authorization', 'oauth_api', 'id'], ''),
    oauthVersion: configuration.getIn(['authorization', 'oauth_api', 'version'], OAUTH_FALLBACK_VERSION),
    componentId: context.get('componentId', ''),
    configurationId: context.get('configurationId', '')
  });
};

const isComplete = function(configuration) {
  return configuration.hasIn(['authorization', 'oauth_api', 'id']) && !!configuration.getIn(['authorization', 'oauth_api', 'id']);
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  isComplete: isComplete
};
