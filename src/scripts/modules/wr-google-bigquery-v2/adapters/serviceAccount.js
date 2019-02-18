import Immutable from 'immutable';

const createConfiguration = function(localState) {
  if (!localState.has('privateKey')) {
    return Immutable.fromJS({});
  }
  const config = Immutable.fromJS({
    parameters: {
      service_account: {
        type: localState.get('type', ''),
        project_id: localState.get('projectId', ''),
        private_key_id: localState.get('privateKeyId', ''),
        '#private_key': localState.get('privateKey', ''),
        client_email: localState.get('clientEmail', ''),
        client_id: localState.get('clientId', ''),
        auth_uri: localState.get('authUri', ''),
        token_uri: localState.get('tokenUri', ''),
        auth_provider_x509_cert_url: localState.get('authProviderX509CertUrl', ''),
        client_x509_cert_url: localState.get('clientX509CertUrl', '')
      }
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    type: configuration.getIn(['parameters', 'service_account', 'type'], ''),
    projectId: configuration.getIn(['parameters', 'service_account', 'project_id'], ''),
    privateKeyId: configuration.getIn(['parameters', 'service_account', 'private_key_id'], ''),
    privateKey: configuration.getIn(['parameters', 'service_account', '#private_key'], ''),
    clientEmail: configuration.getIn(['parameters', 'service_account', 'client_email'], ''),
    clientId: configuration.getIn(['parameters', 'service_account', 'client_id'], ''),
    authUri: configuration.getIn(['parameters', 'service_account', 'auth_uri'], ''),
    tokenUri: configuration.getIn(['parameters', 'service_account', 'token_uri'], ''),
    authProviderX509CertUrl: configuration.getIn(['parameters', 'service_account', 'auth_provider_x509_cert_url'], ''),
    clientX509CertUrl: configuration.getIn(['parameters', 'service_account', 'client_x509_cert_url'], '')
  });
};

const isComplete = function(configuration) {
  if (configuration.getIn(['parameters', 'service_account', 'private_key_id'], '') === '') {
    return false;
  }
  return true;
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  isComplete: isComplete
};
