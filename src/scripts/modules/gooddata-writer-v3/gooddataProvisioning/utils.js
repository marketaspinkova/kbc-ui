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

export function loadNewProjectProvisioningData(pid) {
  return api.getProjectDetail(pid).then(({ token }) => {
    return Promise.delay(10000).then(() => api.getSSOAccess(pid).then((sso) => ({ sso, token })));
  });
}

export function loadProvisioningData(pid) {
  return api.getProjectDetail(pid)
    .then(({ token }) => api.getSSOAccess(pid).then((sso) => ({ sso, token })))
    .catch((error) => {
      if (error.message && error.message === `Project ${encodeURIComponent(pid)} not found in database`) {
        return; // user uses own existing gooddata project
      }

      throw error;
    });
}
