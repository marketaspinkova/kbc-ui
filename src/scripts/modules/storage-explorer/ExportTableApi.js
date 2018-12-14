import ComponentsStore from '../components/stores/ComponentsStore';
import ApplicationStore from '../../stores/ApplicationStore';
import request from '../../utils/request';

const createUrl = path => {
  return ComponentsStore.getComponent('keboola.sapi-merged-export').get('uri') + '/' + path;
};

const createRequest = (method, path) => {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

export default {
  export: tableId => {
    const params = {
      configData: {
        storage: {
          input: {
            tables: [
              {
                source: tableId,
                destination: tableId + '.csv'
              }
            ]
          }
        }
      }
    };

    return createRequest('POST', 'run')
      .send(params)
      .promise()
      .then(response => {
        return response.body;
      });
  }
};
