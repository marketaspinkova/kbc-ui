import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';
import JobPoller from '../../utils/jobPoller';
// import later from 'later';

const checkJobResult = (jobResponse) => {
  if (jobResponse.status === 'error') {
    throw jobResponse;
  } else {
    return jobResponse;
  }
};

const createUrl = function(path) {
  const  baseUrl = ComponentsStore.getComponent('provisioning').get('uri');
  return baseUrl + '/' + path;
};

const createRequest = function(method, path, token) {
  var sapiToken = token;
  if (!sapiToken) {
    sapiToken = ApplicationStore.getSapiTokenString();
  }
  return request(method, createUrl(path)).set('X-StorageApi-Token', sapiToken);
};

const ProvisioningApi = {
  getCredentials: function(backend, credentialsType, token) {
    return createRequest('GET', backend, token)
      .query({
        'type': credentialsType
      })
      .promise()
      .then(function(response) {
        return response.body;
      });
  },

  createCredentials: function(backend, credentialsType, token) {
    const requestData = {
      type: credentialsType
    };
    return createRequest('POST', backend, token)
      .send(requestData)
      .promise()
      .then(function(response) {
        return response.body;
      });
  },

  dropCredentials: function(backend, credentialsId, token) {
    return createRequest('DELETE', backend + '/' + credentialsId, token)
      .promise()
      .then(function(response) {
        return response.body;
      });
  },

  extendCredentials: function(backend, credentialsId, token) {
    return createRequest('POST', backend + '/' + credentialsId + '/extend', token)
      .promise()
      .then(function(response) {
        return response.body;
      });
  },

  createCredentialsAsync: function(backend, credentialsType, data, options) {
    var requestData = data;
    if (!requestData) {
      requestData = {};
    }
    const pathSuffix = options && options.source ? '/' + options.source : '';
    if (!options) {
      requestData.type = credentialsType;
    }
    const sapiToken = ApplicationStore.getSapiTokenString();
    return createRequest('POST', 'async/' + backend + pathSuffix)
      .send(requestData)
      .promise()
      .then(function(response) {
        return JobPoller.poll(sapiToken, response.body.url, 1000).then(checkJobResult);
      })
      .then(function() {
        return ProvisioningApi.getCredentials('docker', credentialsType);
      });
  },

  dropCredentialsAsync: function(backend, credentialsId) {
    const sapiToken = ApplicationStore.getSapiTokenString();
    return createRequest('DELETE', 'async/' + backend + '/' + credentialsId)
      .promise()
      .then(function(response) {
        return JobPoller.poll(sapiToken, response.body.url, 1000).then(checkJobResult);
      })
      .then(function(jobResult) {
        return jobResult.result;
      });
  }
};

export default ProvisioningApi;
