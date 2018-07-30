import api from './api';
import Promise from 'bluebird';

export const TokenTypes = {
  DEMO: 'demo',
  PRODUCTION: 'production',
  CUSTOM: 'custom'
};

export const ProvisioningStates = {
  OWN_CREDENTIALS: 'OWND_CREDENTIALS',
  KBC_NO_SSO: 'KBC_NO_SSO',
  KBC_WITH_SSO: 'KBC_WITH_SSO',
  ERROR: 'ERROR'
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
  const { OWN_CREDENTIALS, KBC_WITH_SSO, KBC_NO_SSO, ERROR } = ProvisioningStates;
  return api.getProjectDetail(pid).then(
    ({ authToken }) =>
      api
        .getSSOAccess(pid)
        .then(({ link }) => ({ state: KBC_WITH_SSO, link, authToken }), () => ({ state: KBC_NO_SSO, authToken })),
    err => {
      if (err.status === 404) {
        return Promise.resolve({ state: OWN_CREDENTIALS });
      } else {
        return Promise.resolve({ state: ERROR, error: err });
      }
    }
  );
}
