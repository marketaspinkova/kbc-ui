import SyrupApi from '../components/SyrupComponentApi';
import dockerProxyApi from './templates/dockerProxyApi';
// componentId = 'wr-db'

export default function(componentId) {
  const createRequest = function(method, configId, path) {
    // path = "#{driver}/#{configId}/#{path}"
    return SyrupApi.createRequest(componentId, method, `${configId}/${path}`);
  };

  const proxyApi = dockerProxyApi(componentId);

  return {
    getCredentials(configId) {
      const proxyPromise = proxyApi ? proxyApi.getCredentials(configId) : false;
      return (
        proxyPromise ||
        createRequest('GET', configId, 'credentials')
          .promise()
          .then(response => response.body)
      );
    },

    postCredentials(configId, credentials) {
      credentials.allowedTypes = null;
      const proxyPromise = proxyApi ? proxyApi.postCredentials(configId, credentials) : false;
      return (
        proxyPromise ||
        createRequest('POST', configId, 'credentials')
          .send(credentials)
          .promise()
          .then(response => response.body)
      );
    },

    deleteTable(configId, tableId) {
      const proxyPromise = proxyApi ? proxyApi.deleteTable(configId, tableId) : false;
      return proxyPromise || createRequest('DELETE', configId, `config-tables/${tableId}`).promise();
    },

    getTables(configId) {
      const proxyPromise = proxyApi ? proxyApi.getTables(configId) : false;
      return (
        proxyPromise ||
        createRequest('GET', configId, 'config-tables')
          .promise()
          .then(response => response.body)
      );
    },

    getTable(configId, tableId) {
      const proxyPromise = proxyApi ? proxyApi.getTable(configId, tableId) : false;
      const path = `config-tables/${tableId}`;
      return (
        proxyPromise ||
        createRequest('GET', configId, path)
          .promise()
          .then(response => response.body)
      );
    },

    setTableColumns(configId, tableId, columns) {
      const proxyPromise = proxyApi ? proxyApi.setTableColumns(configId, tableId, columns) : false;
      const path = `tables/${tableId}/columns`;
      return (
        proxyPromise ||
        createRequest('POST', configId, path)
          .send(columns)
          .promise()
          .then(response => response.body)
      );
    },

    postTable(configId, tableId, table, tableColumns) {
      const proxyPromise = proxyApi ? proxyApi.postTable(configId, tableId, table, tableColumns) : false;
      const path = `tables/${tableId}`;
      return (
        proxyPromise ||
        createRequest('POST', configId, path)
          .send(table)
          .promise()
          .then(response => response.body)
      );
    },

    setTable(configId, tableId, dbName, isExported) {
      const exported = isExported ? 1 : 0;
      const path = `tables/${tableId}`;
      const data = {
        dbName: dbName,
        export: exported
      };
      const proxyPromise = proxyApi ? proxyApi.setTable(configId, tableId, data) : false;
      return (
        proxyPromise ||
        createRequest('POST', configId, path)
          .send(data)
          .promise()
          .then(response => response.body)
      );
    }
  };
}
