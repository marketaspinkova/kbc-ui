import request from '../../../utils/request';
import ApplicationStore from '../../../stores/ApplicationStore';

const createUrl = function(path) {
  const  baseUrl = 'https://gooddata-provisioning.keboola.com';
  return baseUrl + '/' + path;
};

const createRequest = function(method, path) {
  const sapiToken = ApplicationStore.getSapiTokenString();
  return request(method, createUrl(path)).set('X-StorageApi-Token', sapiToken);
};

export default {
  createProjectAndUser(name, token) {
    const tokenProperty = ['demo', 'production'].includes(token) ? 'keboolaToken' : 'customToken';
    const requestData = {
      name,
      [tokenProperty]: token
    };
    return createRequest('POST', 'projects?user=true')
      .send(requestData)
      .promise()
      .then(response => response.body);
  },

  getProjectDetail(pid) {
    return createRequest('GET', `projects/${pid}`)
      .promise()
      .then(response => response.body);
  },

  getSSOAccess(pid) {
    return createRequest('GET', `projects/${pid}/access`)
      .promise()
      .then(response => response.body);
  },

  disableSSOAccess(pid) {
    return createRequest('DELETE', `projects/${pid}/access`)
      .promise()
      .then(response => response.body);
  },

  enableSSOAccess(pid) {
    return createRequest('POST', `projects/${pid}/access`)
      .promise()
      .then(response => response.body);
  },

  deleteProject(pid) {
    return createRequest('DELETE', `projects/${pid}?user=true`)
      .promise()
      .then(response => response.body);
  }
};
