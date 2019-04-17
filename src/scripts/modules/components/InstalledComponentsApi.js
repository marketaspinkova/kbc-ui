import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import TransformationBucketsStore from '../transformations/stores/TransformationBucketsStore';
import InstalledComponentsStore from './stores/InstalledComponentsStore';
import ServicesStore from '../services/Store';

const createUrl = function(path) {
  const baseUrl = ApplicationStore.getSapiUrl();
  return baseUrl + '/v2/storage/' + path;
};

const createRequest = function(method, path) {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

const installedComponentsApi = {
  getComponentConfiguration: function(componentId, configId) {
    const url = 'components/' + componentId + '/configs/' + configId;
    return createRequest('GET', url).promise().then(function(response) {
      return response.body;
    });
  },
  getComponents: function() {
    return createRequest('GET', 'components').promise().then(function(response) {
      return response.body;
    });
  },
  getDeletedComponents: function() {
    return createRequest('GET', 'components?isDeleted=1').promise().then(function(response) {
      return response.body;
    });
  },
  getComponentConfigurations: function(componentId) {
    return createRequest('GET', 'components/' + componentId + '/configs').promise().then(function(response) {
      return response.body;
    });
  },
  getDeletedComponentConfigurations: function(componentId) {
    return createRequest('GET', 'components/' + componentId + '/configs?isDeleted=1').promise().then(function(response) {
      return response.body;
    });
  },
  updateComponentConfiguration: function(componentId, configurationId, data, changeDescription) {
    if (changeDescription) {
      data.changeDescription = changeDescription;
    }
    return createRequest('PUT', 'components/' + componentId + '/configs/' + configurationId).type('form').send(data).promise().then(function(response) {
      return response.body;
    });
  },
  encryptConfiguration: function(componentId, projectId, data) {
    const dockerRunnerUrl = ServicesStore.getService('docker-runner').get('url');
    return request('POST', dockerRunnerUrl + '/docker/encrypt?componentId=' + componentId + '&projectId=' + projectId).set('Content-Type', 'application/json').send(data).promise();
  },
  createConfiguration: function(componentId, data, changeDescription) {
    if (changeDescription) {
      data.changeDescription = changeDescription;
    }
    return createRequest('POST', 'components/' + componentId + '/configs').type('form').send(data).promise().then(function(response) {
      return response.body;
    });
  },
  deleteConfiguration: function(componentId, configurationId) {
    return createRequest('DELETE', 'components/' + componentId + '/configs/' + configurationId).promise().then(function(response) {
      return response.body;
    });
  },
  restoreConfiguration: function(componentId, configurationId) {
    return createRequest('POST', 'components/' + componentId + '/configs/' + configurationId + '/restore').promise().then(function(response) {
      return response.body;
    });
  },
  getComponentConfigVersions: function(componentId, configId) {
    const url = 'components/' + componentId + '/configs/' + configId + '/versions';
    return createRequest('GET', url).promise().then(function(response) {
      return response.body;
    });
  },
  getComponentConfigRowVersions: function(componentId, configId, rowId) {
    const url = 'components/' + componentId + '/configs/' + configId + '/rows/' + rowId + '/versions';
    return createRequest('GET', url).promise().then(function(response) {
      return response.body;
    });
  },

  getComponentConfigByVersion: function(componentId, configId, versionId) {
    const url = 'components/' + componentId + '/configs/' + configId + '/versions/' + versionId;
    return createRequest('GET', url).promise().then(function(response) {
      return response.body;
    });
  },
  getComponentConfigRowByVersion: function(componentId, configId, rowId, versionId) {
    const url = 'components/' + componentId + '/configs/' + configId + '/rows/' + rowId + '/versions/' + versionId;
    return createRequest('GET', url).promise().then(function(response) {
      return response.body;
    });
  },

  rollbackVersion: function(componentId, configId, version) {
    const url = 'components/' + componentId + '/configs/' + configId + '/versions/' + version + '/rollback';
    return createRequest('POST', url).promise().then(function(response) {
      return response.body;
    });
  },
  rollbackRowVersion: function(componentId, configId, rowId, version) {
    const url = 'components/' + componentId + '/configs/' + configId + '/rows/' + rowId + '/versions/' + version + '/rollback';
    return createRequest('POST', url).promise().then(function(response) {
      return response.body;
    });
  },


  createConfigCopy: function(componentId, configId, version, name) {
    var config, description;
    if (componentId === 'transformation') {
      config = TransformationBucketsStore.get(configId);
    } else {
      config = InstalledComponentsStore.getConfig(componentId, configId);
    }
    description = 'Created from ' + (config.get('name')) + ' version #' + version;
    if (config.get('description')) {
      description += '\n\n' + (config.get('description'));
    }
    const url = 'components/' + componentId + '/configs/' + configId + '/versions/' + version + '/create';
    const data = {
      name: name,
      description: description
    };
    return createRequest('POST', url).type('form').send(data).promise().then(function(response) {
      return response.body;
    });
  },
  createConfigurationRow: function(componentId, configurationId, data, changeDescription) {
    if (changeDescription) {
      data.changeDescription = changeDescription;
    }
    return createRequest('POST', 'components/' + componentId + '/configs/' + configurationId + '/rows').type('form').send(data).promise().then(function(response) {
      return response.body;
    });
  },
  getConfigurationRow: function(componentId, configurationId, rowId) {
    return createRequest('GET', 'components/' + componentId + '/configs/' + configurationId + '/rows/' + rowId).send().promise().then(function(response) {
      return response.body;
    });
  },
  deleteConfigurationRow: function(componentId, configurationId, rowId, changeDescription) {
    const data = {
      changeDescription: changeDescription
    };
    return createRequest('DELETE', 'components/' + componentId + '/configs/' + configurationId + '/rows/' + rowId).type('form').send(data).promise().then(function(response) {
      return response.body;
    });
  },
  updateConfigurationRow: function(componentId, configurationId, rowId, data, changeDescription) {
    var formData = data;
    if (changeDescription) {
      formData.changeDescription = changeDescription;
    }
    return createRequest('PUT', 'components/' + componentId + '/configs/' + configurationId + '/rows/' + rowId)
      .type('form')
      .send(formData)
      .promise()
      .then(function(response) {
        return response.body;
      });
  },
  updateConfigurationRowEncrypted: function(componentUrl, componentId, configurationId, rowId, data) {
    return request('PUT', componentUrl + '/configs/' + configurationId + '/rows/' + rowId).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString()).type('form').send(data).promise().then(function(response) {
      if (JSON.stringify(response.body.configuration).indexOf('[]') >= 0) {
        return createRequest('GET', 'components/' + componentId + '/configs/' + configurationId + '/rows/' + rowId)
          .promise()
          .then(function(requestResponse) {
            return requestResponse.body;
          });
      }
      return response.body;
    });
  },
  orderRows: function(componentId, configurationId, rowIds, changeDescription) {
    const formData = {
      rowsSortOrder: rowIds,
      changeDescription: changeDescription
    };
    return createRequest('PUT', 'components/' + componentId + '/configs/' + configurationId)
      .type('form')
      .send(formData)
      .promise()
      .then(function(response) {
        return response.body;
      });
  }
};

export default installedComponentsApi;
