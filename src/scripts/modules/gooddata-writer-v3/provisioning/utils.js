import api from './api';
import Promise from 'bluebird';

export const ActionTypes = {
  CREATE: 'CREATE',
  USE_EXISTING: 'USE_EXISTING'
};

export const TokenTypes = {
  DEMO: 'demo',
  PRODUCTION: 'production',
  CUSTOM: 'custom'
};

const isCustomToken = (token) => token === TokenTypes.CUSTOM;

export default {
  isNewProjectValid({ name, action, tokenType, customToken, login, password, pid }) {
    if (action === ActionTypes.CREATE) {
      return !!name && (isCustomToken(tokenType) ? !!customToken : true);
    }

    if (action === ActionTypes.USE_EXISTING) {
      return !!login && !!password && !!pid;
    }
    return false;
  },

  prepareProject({ name, action, tokenType, customToken, login, password, pid }) {
    if (action === ActionTypes.CREATE) {
      const token = isCustomToken(tokenType) ? customToken : tokenType;
      api.createProjectAndUser(name, token);
    } else {
      return Promise.resolve({
        pid, login, password
      });
    }
  }
};
