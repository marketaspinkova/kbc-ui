import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';
import InstalledComponentsApi from '../components/InstalledComponentsApi';
import parseBuckets from './utils/parseBuckets';
import parseBucket from './utils/parseBucket';
import parseTransformation from './utils/parseTransformation';

var createUrl = function(path) {
  var baseUrl;
  baseUrl = ComponentsStore.getComponent('transformation').get('uri');
  return baseUrl + '/' + path;
};

var createRequest = function(method, path) {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

var transformationsApi = {

  getTransformationBuckets: function() {
    return InstalledComponentsApi.getComponentConfigurations('transformation').then(function(response) {
      return parseBuckets(response);
    });
  },

  createTransformationBucket: function(data, changeDescription) {
    return InstalledComponentsApi.createConfiguration('transformation', data, changeDescription).then(function(response) {
      return parseBucket(response);
    });
  },

  deleteTransformationBucket: function(bucketId) {
    return InstalledComponentsApi.deleteConfiguration('transformation', bucketId);
  },

  restoreTransformationBucket: function(bucketId) {
    return InstalledComponentsApi.restoreConfiguration('transformation', bucketId);
  },

  deleteTransformation: function(bucketId, transformationId, changeDescription) {
    return InstalledComponentsApi.deleteConfigurationRow('transformation', bucketId, transformationId, changeDescription);
  },

  createTransformation: function(bucketId, data, changeDescription) {
    var form = {
      name: data.name
    };
    delete data.name;
    if (data.description) {
      form.description = data.description;
      delete data.description;
    }
    form.configuration = JSON.stringify(data);
    return InstalledComponentsApi.createConfigurationRow('transformation', bucketId, form, changeDescription).then(function(response) {
      return parseTransformation(response);
    });
  },

  saveTransformation: function(bucketId, transformationId, data, changeDescription) {
    if (data.queriesString) {
      delete data.queriesString;
    }
    var form = {
      configuration: JSON.stringify(data),
      changeDescription: changeDescription
    };
    return InstalledComponentsApi.updateConfigurationRow('transformation', bucketId, transformationId, form).then(function(response) {
      return parseTransformation(response);
    });
  },

  getGraph: function(configuration) {
    var path;
    path = 'graph?table=' + configuration.tableId;
    path = path + ('&direction=' + configuration.direction);
    path = path + '&showDisabled=' + (configuration.showDisabled ? '1' : '0');
    path = path + '&limit=' + JSON.stringify(configuration.limit);
    return createRequest('GET', path).promise().then(function(response) {
      return response.body;
    });
  }
};

export default transformationsApi;
