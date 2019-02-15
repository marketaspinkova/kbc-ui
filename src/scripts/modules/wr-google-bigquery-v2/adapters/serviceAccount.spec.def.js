export const cases = {
  emptyWithDefaults: {
    localState: {
      type: '',
      projectId: '',
      privateKeyId: '',
      privateKey: '',
      clientEmail: '',
      clientId: '',
      authUri: '',
      tokenUri: '',
      authProviderX509CertUrl: '',
      clientX509CertUrl: ''
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
      projectId: 'project_id',
      privateKeyId: 'private_key_id',
      privateKey: 'private_key',
      clientEmail: 'client_email',
      clientId: 'client_id',
      authUri: 'auth_uri',
      tokenUri: 'token_uri',
      authProviderX509CertUrl: 'auth_provider_x509_cert_url',
      clientX509CertUrl: 'client_x509_cert_url'
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

