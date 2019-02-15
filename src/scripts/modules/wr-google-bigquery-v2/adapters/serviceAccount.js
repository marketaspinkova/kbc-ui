import Immutable from 'immutable';

const createConfiguration = function(localState) {
  if (!localState.has('private_key')) {
    return Immutable.fromJS({});
  }
  const config = Immutable.fromJS({
    parameters: {
      service_account: {
        type: localState.get('type', ''),
        project_id: localState.get('project_id', ''),
        private_key_id: localState.get('private_key_id', ''),
        '#private_key': localState.get('private_key', ''),
        client_email: localState.get('client_email', ''),
        client_id: localState.get('client_id', ''),
        auth_uri: localState.get('auth_uri', ''),
        token_uri: localState.get('token_uri', ''),
        auth_provider_x509_cert_url: localState.get('auth_provider_x509_cert_url', ''),
        client_x509_cert_url: localState.get('client_x509_cert_url', '')
      }
    }
  });
  return config;
};

const parseConfiguration = function(configuration) {
  return Immutable.fromJS({
    type: configuration.getIn(['parameters', 'service_account', 'type'], ''),
    project_id: configuration.getIn(['parameters', 'service_account', 'project_id'], ''),
    private_key_id: configuration.getIn(['parameters', 'service_account', 'private_key_id'], ''),
    private_key: configuration.getIn(['parameters', 'service_account', '#private_key'], ''),
    client_email: configuration.getIn(['parameters', 'service_account', 'client_email'], ''),
    client_id: configuration.getIn(['parameters', 'service_account', 'client_id'], ''),
    auth_uri: configuration.getIn(['parameters', 'service_account', 'auth_uri'], ''),
    token_uri: configuration.getIn(['parameters', 'service_account', 'token_uri'], ''),
    auth_provider_x509_cert_url: configuration.getIn(['parameters', 'service_account', 'auth_provider_x509_cert_url'], ''),
    client_x509_cert_url: configuration.getIn(['parameters', 'service_account', 'client_x509_cert_url'], '')
  });
};

const isComplete = function(configuration) {
  if (configuration.getIn(['parameters', 'service_account', '#private_key'], '') === '') {
    return false;
  }
  return true;
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  isComplete: isComplete
};
