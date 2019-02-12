import { Map, fromJS } from 'immutable';
import { Constants } from '../../oauth-v2/Constants';

const createConfiguration = function(localState) {
  let config = Map();

  if (localState.get('oauthId')) {
    config = config.setIn(['authorization', 'oauth_api', 'id'], localState.get('oauthId'));
  }

  if (localState.get('oauthVersion') === Constants.OAUTH_VERSION_3) {
    config = config.setIn(['authorization', 'oauth_api', 'version'], Constants.OAUTH_VERSION_3);
  }

  return config;
};

const parseConfiguration = function(configuration, context) {
  return fromJS({
    oauthId: configuration.getIn(['authorization', 'oauth_api', 'id'], ''),
    oauthVersion: configuration.getIn(['authorization', 'oauth_api', 'version'], Constants.OAUTH_VERSION_FALLBACK),
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
