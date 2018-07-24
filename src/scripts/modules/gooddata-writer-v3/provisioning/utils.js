import api from './api';

export const ActionTypes = {
  CREATE: 'CREATE',
  USE_EXISTING: 'USE_EXISTING'
};

export const TokenTypes = {
  DEMO: 'demo',
  PRODUCTION: 'production',
  CUSTOM: 'custom'
};



export default {
  prepareProject(name, gdToken) {
    api.createProjectAndUser(name, gdToken);
  }
};
