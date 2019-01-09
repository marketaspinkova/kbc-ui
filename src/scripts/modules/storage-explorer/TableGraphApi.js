import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';

const createUrl = path => {
  return ComponentsStore.getComponent('transformation').get('uri') + '/' + path;
};

const createRequest = (method, path) => {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

export default {
  load(tableId, direction) {
    const params = {
      table: tableId,
      direction
    };

    return createRequest('GET', 'graph')
      .query(params)
      .promise()
      .then(response => response.body);
  }
};
