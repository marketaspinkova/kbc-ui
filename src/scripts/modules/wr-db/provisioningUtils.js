import StorageService from '../tokens/actionCreators';
import SapiStorage from '../tokens/StorageTokensStore';
import Promise from 'bluebird';
import wrDbProvStore from '../provisioning/stores/WrDbCredentialsStore';
import provisioningActions from '../provisioning/ActionCreators';

const OLD_WR_REDSHIFT_COMPONENT_ID = 'wr-db-redshift';
const NEW_WR_REDSHIFT_COMPONENT_ID = ['keboola.wr-redshift-v2', 'keboola.wr-qlik', 'keboola.wr-looker'];
const WR_SNOWFLAKE_COMPONENT_ID = 'keboola.wr-db-snowflake';

const getDriverAndPermission = (driverParam, permissionParam, componentId) => {
  let driver = driverParam;
  let permission = permissionParam;
  if (driver === 'mysql') {
    driver = 'wrdb';
  }
  if (componentId === OLD_WR_REDSHIFT_COMPONENT_ID) {
    driver = 'redshift';
  }
  if (NEW_WR_REDSHIFT_COMPONENT_ID.includes(componentId)) {
    driver = 'redshift-workspace';
    permission = 'writer';
  }
  if (componentId === WR_SNOWFLAKE_COMPONENT_ID) {
    driver = 'snowflake';
    permission = 'writer';
  }
  return {
    driver,
    permission
  };
};

// load credentials and if they dont exists then create new
const loadCredentials = (permission, token, driver, forceRecreate, componentId) => {
  const { driver: realDriver, permission: realPermission } = getDriverAndPermission(driver, permission, componentId);
  return provisioningActions.loadWrDbCredentials(realPermission, token, realDriver).then(() => {
    const creds = wrDbProvStore.getCredentials(realPermission, token);
    if (creds && !forceRecreate) {
      return creds;
    } else {
      return provisioningActions
        .createWrDbCredentials(realPermission, token, realDriver)
        .then(() => wrDbProvStore.getCredentials(realPermission, token));
    }
  });
};

const getWrDbToken = (desc, legacyDesc) =>
  StorageService.loadTokens().then(() => {
    const tokens = SapiStorage.getAll();
    const wrDbToken = tokens.find(token => {
      const needle = token.get('description');
      return [desc, legacyDesc].includes(needle);
    });
    return wrDbToken;
  });

const retrieveProvisioningCredentials = (isReadOnly, wrDbToken, driver, componentId) => {
  let loadPromise = null;

  switch (driver) {
    case 'redshift':
      loadPromise = loadCredentials('write', wrDbToken, driver, false, componentId);
      return Promise.props({
        read: loadPromise,
        write: isReadOnly ? null : loadPromise
      });
    case 'snowflake':
      loadPromise = loadCredentials('write', wrDbToken, driver, false, componentId);
      return Promise.props({
        read: loadPromise,
        write: isReadOnly ? null : loadPromise
      });
    default:
      return Promise.props({
        read: loadCredentials('read', wrDbToken, driver, false, componentId),
        write: !isReadOnly ? loadCredentials('write', wrDbToken, driver, false, componentId) : null
      });
  }
};

const _dropCredentials = (driver, permission, token, configHasCredentials) => {
  if (configHasCredentials && wrDbProvStore.getCredentials(permission, token)) {
    return provisioningActions.dropWrDbCredentials(permission, token, driver);
  }
};

const clearCredentials = (componentId, driver, token, configCredentials) => {
  const hasReadCredentials = configCredentials && configCredentials.get('read', null);
  const hasWriteCredentials = configCredentials && configCredentials.get('write', null);
  const readTypes = getDriverAndPermission(driver, 'read', componentId);
  const writeTypes = getDriverAndPermission(driver, 'write', componentId);
  const writePromise = _dropCredentials(writeTypes.driver, writeTypes.permission, token, hasWriteCredentials);
  let readPromise = null;
  if (
    readTypes.driver !== writeTypes.driver ||
    readTypes.permission !== writeTypes.permission ||
    !hasWriteCredentials
  ) {
    readPromise = _dropCredentials(readTypes.driver, readTypes.permission, token, hasReadCredentials);
  }
  return Promise.props({
    read: readPromise,
    write: writePromise
  });
};

export default {
  getCredentials(isReadOnly, driver, componentId, configId) {
    const desc = `wrdb${driver}_${configId}`;
    const legacyDesc = `wrdb${driver}`;
    let wrDbToken = null;
    return getWrDbToken(desc, legacyDesc).then(token => {
      wrDbToken = token;
      if (!wrDbToken) {
        const params = {
          description: desc,
          canManageBuckets: 1
        };
        return StorageService.createToken(params).then(() => {
          const tokens = SapiStorage.getAll();
          wrDbToken = tokens.find(storageToken => storageToken.get('description') === desc);
          wrDbToken = wrDbToken.get('token');
          return retrieveProvisioningCredentials(isReadOnly, wrDbToken, driver, componentId);
        });
      } else {
        // token exists
        wrDbToken = wrDbToken.get('token');
        return retrieveProvisioningCredentials(isReadOnly, wrDbToken, driver, componentId);
      }
    });
  },

  clearAll(componentId, configId, driver, currentCredentials) {
    const desc = `wrdb${driver}_${configId}`;
    const legacyDesc = `wrdb${driver}`;
    return getWrDbToken(desc, legacyDesc).then(token => {
      if (!token) {
        return;
      }
      const tokenStr = token.get('token');
      return clearCredentials(componentId, driver, tokenStr, currentCredentials).then(() =>
        StorageService.deleteToken(token)
      );
    });
  }
};
