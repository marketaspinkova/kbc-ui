import api from './api';
import Promise from 'bluebird';

export const TokenTypes = {
  DEMO: 'demo',
  PRODUCTION: 'production',
  CUSTOM: 'custom'
};

export function isCustomToken(token) {
  return token === TokenTypes.CUSTOM;
}

export function isNewProjectValid({ name, isCreateNewProject, tokenType, customToken, login, password, pid }) {
  if (isCreateNewProject) {
    return !!name && (isCustomToken(tokenType) ? !!customToken : true);
  } else {
    return !!login && !!password && !!pid;
  }
}

export function loadProvisioningData(pid) {
  return api.getProjectDetail(pid).then(
    ({ token }) => {
      return api.getSSOAccess(pid).then(
        sso => ({ sso, token }),
        () => ({ token })
      );
    },
    err => {
      let result = null;
      const status = (err.response || {}).status;
      if (status !== 404) {
        result = Promise.reject({ error: err.message || err });
      }
      return result;
    }
  );
}
