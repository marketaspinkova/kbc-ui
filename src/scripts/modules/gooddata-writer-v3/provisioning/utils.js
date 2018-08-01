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
    ({ token }) =>
      api.getSSOAccess(pid).then(sso => ({ sso, token }), () => ({ token })),
    err => {
      const status = (err.response || {}).status;
      return status !== 404 ? Promise.reject({ error: err.message || err }) : null;
    }
  );
}
