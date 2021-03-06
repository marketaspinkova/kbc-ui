import request from '../../../utils/request';
import ApplicationStore from '../../../stores/ApplicationStore';
import {TokenTypes} from './utils';
import ServicesStore from '../../services/Store';

const createUrl = function(path) {
  const baseUrl = ServicesStore.getService('gooddata-provisioning').get('url');
  return baseUrl + '/' + path;
};

const createRequest = function(method, path) {
  return request(method, createUrl(path))
    .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

export default {
  createProjectAndUser(name, token) {
    const keboolaTokens = [TokenTypes.DEMO, TokenTypes.PRODUCTION];
    const tokenProperty = keboolaTokens.includes(token) ? 'keboolaToken' : 'customToken';
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

  deleteProject(pid) {
    return createRequest('DELETE', `projects/${pid}?user=true`)
      .promise()
      .then(response => response.body);
  }
};
