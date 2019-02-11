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

export function loadProvisioningData(pid, newProject = false) {
  return api.getProjectDetail(pid)
    .then(({ token }) => {
      if (newProject) {
        return Promise.delay(7000).then(() => token);
      }
      return token;
    })
    .then((token) => {
      return api.getSSOAccess(pid).then((sso) => ({ sso, token }));
    })
    .catch((error) => {
      if (error.message && error.message === `Project ${encodeURIComponent(pid)} not found in database`) {
        return; // user uses own existing gooddata project
      }

      throw error;
    });
}
