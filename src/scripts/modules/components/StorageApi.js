import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import Promise from 'bluebird';

var createUrl = function(path) {
  var baseUrl;
  baseUrl = ApplicationStore.getSapiUrl();
  return baseUrl + '/v2/storage/' + path;
};

var createRequest = function(method, path) {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

export default {

  verifyToken: function() {
    return createRequest('GET', 'tokens/verify').promise().then(function(response) {
      return response.body;
    });
  },

  getBuckets: function() {
    return createRequest('GET', 'buckets?include=metadata,linkedBuckets').promise().then(function(response) {
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

  sharedBuckets: function() {
    return createRequest('GET', 'shared-buckets').promise().then(response => response.body);
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

  getFilesWithRetry: function(params) {
    const maxRetries = 3; // total attempts = max retries + 1

    const withRetry = (attempt = 1) => {
      return this.getFiles(params)
        .then(files => {
          if (files.length === 0 && attempt <= maxRetries) {
            return Promise.reject(new Error("No files found yet"));
          }
          return Promise.resolve(files);
        })
        .catch(() => {
          return (new Promise((res) => {
            return setTimeout(res, Math.pow(2, attempt) * 500);
          })).then(() => {
            return withRetry(attempt + 1);
          })
        });
    };
    return withRetry();
  },

  deleteFile: function(fileId) {
    return createRequest('DELETE', 'files/' + fileId).promise().then(function(response) {
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

  loadTableSnapshots: function(tableId, params) {
    return createRequest('GET', 'tables/' + tableId + '/snapshots').query(params).promise().then(function(response) {
      return response.body;
    });
  },

  tableDataJsonPreview: function(tableId, params) {
    let queryParams = params || {};
    queryParams.format = 'json';
    return createRequest('GET', 'tables/' + tableId + '/data-preview').type('json').query(queryParams).promise().then(function(response) {
      return response.body;
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

  shareBucket: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/share').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  unshareBucket: function(bucketId) {
    return createRequest('DELETE', 'buckets/' + bucketId + '/share').type('form').promise().then(function(response) {
      return response.body;
    });
  },

  changeBucketSharingType: function(bucketId, params) {
    return createRequest('PUT', 'buckets/' + bucketId + '/share').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createTable: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/tables-async').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  truncateTable: function(tableId) {
    return createRequest('DELETE', 'tables/' + tableId + '/rows').type('form').promise().then(function(response) {
      return response.body;
    });
  },

  deleteTable: function(tableId, params) {
    return createRequest('DELETE', 'tables/' + tableId).type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createTableSync: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/tables').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  createAliasTable: function(bucketId, params) {
    return createRequest('POST', 'buckets/' + bucketId + '/table-aliases').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  setAliasTableFilter: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/alias-filter').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  removeAliasTableFilter: function(tableId) {
    return createRequest('DELETE', 'tables/' + tableId + '/alias-filter').promise().then(function(response) {
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

  removeTablePrimaryKey: function(tableId) {
    return createRequest('DELETE', 'tables/' + tableId + '/primary-key').type('form').promise().then(function(response) {
      return response.body;
    });
  },

  createSnapshot: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/snapshots').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  deleteSnapshot: function(snapshotId) {
    return createRequest('DELETE', 'snapshots/' + snapshotId).type('form').promise().then(function(response) {
      return response.body;
    });
  },

  exportTable: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/export-async').type('form').send(params).promise().then(function(response) {
      return response.body;
    });
  },

  loadDataIntoWorkspace: function(workspaceId, params) {
    return createRequest('POST', 'workspaces/' + workspaceId + '/load').type('form').send(params).promise()
      .then(function(response) {
        return response.body;
      });
  },

  addTableColumn: function(tableId, params) {
    return createRequest('POST', 'tables/' + tableId + '/columns').type('form').send(params).promise()
      .then(function(response) {
        return response.body;
      });
  },

  deleteTableColumn: function(tableId, column, params) {
    return createRequest('DELETE', 'tables/' + tableId + '/columns/' + column).type('form').send(params).promise()
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

  deleteMetadata: function(objectType, objectId, metadataId) {
    const delUrl = this.getMetadataSaveUrl(objectType, objectId) + '/' + metadataId;
    return createRequest('DELETE', delUrl).type('form').promise().then(function(response) {
      return response.body;
    });
  },

  getJobs: function(params) {
    return createRequest('GET', 'jobs').query(params).promise().then(function(response) {
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
    let metadata = [];
    
    data.map((v, k) => {
      if (typeof v !== "undefined") {
        metadata = metadata.concat({ key: k, value: v });
      }
    });

    return {
      provider: provider,
      metadata: metadata
    };
  }
};
