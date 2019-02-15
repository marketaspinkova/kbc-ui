export const cases = {
  emptyWithDefaults: {
    localState: {
      type: '',
      project_id: '',
      private_key_id: '',
      private_key: '',
      client_email: '',
      client_id: '',
      auth_uri: '',
      token_uri: '',
      auth_provider_x509_cert_url: '',
      client_x509_cert_url: ''
    },
    configuration: {
      parameters: {
        service_account: {
          type: '',
          project_id: '',
          private_key_id: '',
          '#private_key': '',
          client_email: '',
          client_id: '',
          auth_uri: '',
          token_uri: '',
          auth_provider_x509_cert_url: '',
          client_x509_cert_url: ''
        }
      }
    }
  },
  simple: {
    localState: {
      type: 'type',
      project_id: 'project_id',
      private_key_id: 'private_key_id',
      private_key: 'private_key',
      client_email: 'client_email',
      client_id: 'client_id',
      auth_uri: 'auth_uri',
      token_uri: 'token_uri',
      auth_provider_x509_cert_url: 'auth_provider_x509_cert_url',
      client_x509_cert_url: 'client_x509_cert_url'
    },
    configuration: {
      parameters: {
        service_account: {
          type: 'type',
          project_id: 'project_id',
          private_key_id: 'private_key_id',
          '#private_key': 'private_key',
          client_email: 'client_email',
          client_id: 'client_id',
          auth_uri: 'auth_uri',
          token_uri: 'token_uri',
          auth_provider_x509_cert_url: 'auth_provider_x509_cert_url',
          client_x509_cert_url: 'client_x509_cert_url'
        }
      }
    }
  }
};

