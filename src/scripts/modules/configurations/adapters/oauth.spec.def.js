export const cases = {
  emptyWithDefaults: {
    localState: {
      oauthId: '',
      oauthVersion: 2,
      componentId: '',
      configurationId: ''
    },
    configuration: {
      authorization: {
        oauth_api: {
          id: ''
        }
      }
    },
    context: {
      componentId: '',
      configurationId: ''
    }
  },
  simple: {
    localState: {
      oauthId: '1234',
      oauthVersion: 2,
      componentId: '567',
      configurationId: '789'
    },
    configuration: {
      authorization: {
        oauth_api: {
          id: '1234'
        }
      }
    },
    context: {
      componentId: '567',
      configurationId: '789'
    }
  },
  version3: {
    localState: {
      oauthId: '1234',
      oauthVersion: 3,
      componentId: '567',
      configurationId: '789'
    },
    configuration: {
      authorization: {
        oauth_api: {
          id: '1234',
          version: 3
        }
      }
    },
    context: {
      componentId: '567',
      configurationId: '789'
    }
  }
};

