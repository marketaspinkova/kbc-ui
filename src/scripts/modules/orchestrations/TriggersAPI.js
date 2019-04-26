import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';

const createUrl = path => {
  const baseUrl = ApplicationStore.getSapiUrl();
  return `${baseUrl}/v2/storage/${path}`;
};

const createRequest = (method, path) =>
  request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default {
  create(data) {
    return createRequest('POST', 'triggers')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(data)
      .then(response => response.body);
  },

  list(component, configurationId) {
    return createRequest('GET', 'triggers')
      .query({
        component: component,
        configurationId: configurationId
      })
      .then(response => response.body);
  },

  update(id, data) {
    return createRequest('PUT', `triggers/${id}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(data)
      .then(response => response.body);
  },

  delete(id) {
    return createRequest('DELETE', `triggers/${id}`);
  }
};
