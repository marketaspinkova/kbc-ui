import request from '../../utils/request';
import parse from '../../utils/parseCsv';
import ApplicationStore from '../../stores/ApplicationStore';

var createUrl = function(path) {
  var baseUrl;
  baseUrl = ApplicationStore.getSapiUrl();
  return baseUrl + '/v2/storage/' + path;
};

var createRequest = function(method, path) {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

var storageApi = {

  getBuckets: function() {
    return createRequest('GET', 'buckets').promise().then(function(response) {
      return response.body;
    });
  },

  getBucketCredentials: function(bucketId) {
    return createRequest('GET', 'buckets/' + bucketId + '/credentials').promise().then(function(response) {
      return response.body;
    });
  },

  createBucketCredentials: function(bucketId, name) {
    return createRequest('POST', 'buckets/' + bucketId + '/credentials').type('form').send({
      name: name
    }).promise().then(function(response) {
      return response.body;
    });
  },

  deleteBucketCredentials: function(credentialsId) {
    return createRequest('DELETE', 'credentials/' + credentialsId).promise().then(function(response) {
      return response.body;
    });
  },

  getTables: function() {
    return createRequest('GET', 'tables?include=attributes,buckets,columns,metadata,columnMetadata').promise().then(function(response) {
      return response.body;
    });
  },

  updateToken(tokenId, params) {
    return createRequest('PUT', `tokens/${tokenId}`).type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createToken: function(params) {
    return createRequest('POST', 'tokens').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  deleteToken: function(tokenId) {
    return createRequest('DELETE', 'tokens/' + tokenId).promise().then(function(response) {
      return response.body;
    });
  },

  refreshToken: function(tokenId) {
    return createRequest('POST', 'tokens/' + tokenId + '/refresh').promise().then(function(response) {
      return response.body;
    });
  },

  shareToken: function(tokenId, email, message) {
    const params = {
      recipientEmail: email,
      message: message
    };
    return createRequest('POST', 'tokens/' + tokenId + '/share')
      .type('form')
      .send(params)
      .promise().then(response => response.body);
  },

  getTokens: function() {
    return createRequest('GET', 'tokens').promise().then(function(response) {
      return response.body;
    });
  },

  getFiles: function(params) {
    return createRequest('GET', 'files').query(params).promise().then(function(response) {
      return response.body;
    });
  },

  getRunIdStats: function(runId) {
    return createRequest('GET', 'stats').query({
      runId: runId
    }).promise().then(function(response) {
      return response.body;
    });
  },

  getKeenCredentials: function() {
    return createRequest('GET', 'tokens/keen').promise().then(function(response) {
      return response.body;
    });
  },

  /*
   Returns parsed CSV info plain arrays
   [
   [] - row 1
   [] - row 2
   ]
   */
  tableDataPreview: function(tableId, params) {
    return createRequest('GET', 'tables/' + tableId + '/data-preview').query(params).promise().then(function(response) {
      return parse(response.text);
    });
  },

  prepareFileUpload: function(params) {
    return createRequest('POST', 'files/prepare').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createBucket: function(params) {
    return createRequest('POST', 'buckets').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  deleteBucket: function(bucketId, params) {
    return createRequest('DELETE', 'buckets/' + bucketId).type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createTable: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/tables-async').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createAliasTable: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/table-aliases').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  loadTable: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/import-async').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createTablePrimaryKey: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/primary-key').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  loadDataIntoWorkspace: function(workspaceId, params) {
    return createRequest('POST', 'workspaces/' + workspaceId + '/load').type('form').send(params).promise()
      .then(function(response) {
        return response.body;
      });
  },

  saveBucketMetadata: function(bucketId, data, provider) {
    var payload = this.prepareMetadataPayload(data, provider);
    return createRequest('POST', 'buckets/' + bucketId + '/metadata').type('form').send(payload).promise()
      .then(function(response) {
        return response.body;
      });
  },

  saveTableMetadata: function(tableId, data, provider) {
    var payload = this.prepareMetadataPayload(data, provider);
    return createRequest('POST', 'tables/' + tableId + '/metadata').type('form').send(payload).promise()
      .then(function(response) {
        return response.body;
      });
  },

  saveColumnMetadata: function(columnId, data, provider) {
    var payload = this.prepareMetadataPayload(data, provider);
    return createRequest('POST', 'columns/' + columnId + '/metadata').type('form').send(payload).promise()
      .then(function(response) {
        return response.body;
      });
  },

  saveMetadata: function(objectType, objectId, data) {
    var payload = this.prepareMetadataPayload(data);
    var saveUrl = this.getMetadataSaveUrl(objectType, objectId);
    return createRequest('POST', saveUrl).type('form').send(payload).promise()
      .then(function(response) {
        return response.body;
      });
  },

  getMetadataSaveUrl: function(objectType, objectId) {
    switch (objectType) {
      case 'bucket':
        return 'buckets/' + objectId + '/metadata';
      case 'table':
        return 'tables/' + objectId + '/metadata';
      case 'column':
        return 'columns/' + objectId + '/metadata';
      default:
    }
  },

  prepareMetadataPayload: function(data, provider = 'user') {
    var metadata = [];
    data.map(function(v, k) {
      metadata = metadata.concat({
        key: k,
        value: v
      });
    });
    return {
      provider: provider,
      metadata: metadata
    };
  }
};

module.exports = storageApi;
