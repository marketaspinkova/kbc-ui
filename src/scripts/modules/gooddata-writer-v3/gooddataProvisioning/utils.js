import Promise from 'bluebird';
import api from './api';

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
  return api.getProjectDetail(pid).then(({ token }) => {
    return Promise.delay(5000).then(() => {
      return api.getSSOAccess(pid).then((sso) => ({ sso, token }));
    });
  });
}
