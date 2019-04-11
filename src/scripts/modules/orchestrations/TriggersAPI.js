import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';

const createUrl = path => {
  const baseUrl = ApplicationStore.getSapiUrl();
  return `${baseUrl}/${path}`;
};

const createRequest = (method, path) =>
  request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default {
  createTrigger(data) {
    return createRequest('POST', 'triggers')
      .send(data)
      .promise()
      .then(response => response.body);
  },

  listTriggers(component, configurationId) {
    return createRequest('GET', 'triggers')
      .query({
        component: component,
        configurationId: configurationId
      })
      .promise()
      .then(response => response.body);
  },

  updateTrigger(id, data) {
    return createRequest('PUT', `triggers/${id}`)
    .send(data)
    .promise()
    .then(response => response.body);
  },

  deleteTrigger(id) {
    return createRequest('DELETE', `triggers/${id}`).promise();
  }
};
