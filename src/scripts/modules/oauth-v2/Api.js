import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';
import ServicesStore from '../services/Store';
import {Constants} from './Constants';

function createUrl(path, version) {
  return getBaseUrl(version) + '/' + path;
}

function getBaseUrl(version) {
  if (version !== Constants.OAUTH_VERSION_FALLBACK) {
    return ServicesStore.getService('oauth').get('url');
  }
  return ComponentsStore.getComponent('keboola.oauth-v2').get('uri');
}

function createRequest(method, path, version) {
  return request(method, createUrl(path, version))
    .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
}

export default {
  getCredentials: function(componentId, id, version) {
    return createRequest('GET', 'credentials/' + componentId + '/' + id, version)
      .promise().then(function(response) {
        return response.body;
      });
  },

  postCredentials: function(componentId, id, authorizedFor, data) {
    const body = {
      id: id,
      authorizedFor: authorizedFor,
      data: data
    };
    return createRequest('POST', 'credentials/' + componentId)
      .send(body)
      .promise().then(function(response) {
        return response.body;
      });
  },

  deleteCredentials: function(componentId, id, version) {
    return createRequest('DELETE', 'credentials/' + componentId + '/' + id, version)
      .promise().then(function(response) {
        return response.body;
      });
  }
};
