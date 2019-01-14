import Promise from 'bluebird';
import _ from 'underscore';
import ApplicationStore from '../../stores/ApplicationStore';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';
import StorageBucketsStore from './stores/StorageBucketsStore';
import StorageTablesStore from './stores/StorageTablesStore';

import StorageFilesStore from './stores/StorageFilesStore';
import storageApi from './StorageApi';
import jobPoller from '../../utils/jobPoller';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';

// via https://github.com/aws/aws-sdk-js/issues/603#issuecomment-228233113
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;

module.exports = {

  loadBucketsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKETS_LOAD
    });
    return storageApi.getBuckets().then(function(buckets) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKETS_LOAD_SUCCESS,
        buckets: buckets
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKETS_LOAD_ERROR,
          status: error.status,
          response: error.response
        });
        throw error;
      });
  },

  loadCredentialsForce: function(bucketId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD,
      bucketId: bucketId
    });
    return storageApi.getBucketCredentials(bucketId).then(function(credentials) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD_SUCCESS,
        credentials: credentials,
        bucketId: bucketId
      });
    });
  },

  loadCredentials: function(bucketId) {
    if (StorageBucketsStore.hasCredentials(bucketId)) {
      return Promise.resolve();
    }
    return this.loadCredentialsForce(bucketId);
  },

  createCredentials: function(bucketId, name) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE,
      bucketId: bucketId
    });
    return storageApi.createBucketCredentials(bucketId, name).then(function(credentials) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE_SUCCESS,
        credentials: credentials,
        bucketId: bucketId
      });
      return credentials;
    });
  },

  deleteCredentials: function(bucketId, credentialsId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE,
      bucketId: bucketId,
      credentialsId: credentialsId
    });
    return storageApi.deleteBucketCredentials(credentialsId).then(function() {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE_SUCCESS,
        bucketId: bucketId,
        credentialsId: credentialsId
      });
    });
  },

  loadBuckets: function() {
    if (StorageBucketsStore.getIsLoaded()) {
      this.loadBucketsForce();
      return Promise.resolve();
    }
    if (StorageBucketsStore.getIsLoading()) {
      return Promise.resolve();
    }
    return this.loadBucketsForce();
  },

  loadTablesForce: function() {
    if (StorageTablesStore.getIsLoading()) {
      return Promise.resolve();
    }
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLES_LOAD
    });
    return storageApi.getTables().then(function(tables) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS,
        tables: tables
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLES_LOAD_ERROR,
          status: error.status,
          response: error.response
        });
        throw error;
      });
  },

  loadTables: function() {
    if (StorageTablesStore.getIsLoaded()) {
      this.loadTablesForce();
      return Promise.resolve();
    }
    if (StorageTablesStore.getIsLoading()) {
      return Promise.resolve();
    }
    return this.loadTablesForce();
  },

  loadFilesForce: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_FILES_LOAD
    });
    return storageApi.getFiles(params).then(function(files) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILES_LOAD_SUCCESS,
        files: files
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_FILES_LOAD_ERROR,
          errors: error
        });
        throw error;
      });
  },

  loadFiles: function(params) {
    if (StorageFilesStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadFilesForce(params);
  },

  loadMoreFiles: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_FILES_LOAD_MORE
    });
    return storageApi.getFiles(params).then(function(files) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILES_LOAD_MORE_SUCCESS,
        files: files
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_FILES_LOAD_MORE_ERROR,
          errors: error
        });
        throw error;
      });
  },

  createBucket: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREATE,
      params: params
    });
    return storageApi.createBucket(params).then(function(response) {
      if (response.status === 'error') {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR,
          errors: response.error
        });
        throw response.error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREATE_SUCCESS,
        bucket: response
      });
      return response;
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR,
          errors: error
        });
        throw message;
      });
  },

  deleteBucket: function(bucketId, force) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_DELETE,
      bucketId: bucketId
    });
    return storageApi.deleteBucket(bucketId, { force }).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_DELETE_SUCCESS,
        bucketId: bucketId
      });
      return ApplicationActionCreators.sendNotification({
        message: `Bucket ${bucketId} has been removed`
      });
    })
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_DELETE_ERROR,
          bucketId: bucketId
        });
        throw error;
      });
  },

  shareBucket: function(bucketId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_SHARE,
      bucketId: bucketId
    });
    return storageApi.shareBucket(bucketId, params).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_SHARE_SUCCESS,
        bucketId: bucketId
      });
      return this.loadBucketsForce();
    })
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_SHARE_ERROR,
          bucketId: bucketId
        });
        throw error;
      });
  },

  unshareBucket: function(bucketId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_UNSHARE,
      bucketId: bucketId
    });
    return storageApi.unshareBucket(bucketId).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_UNSHARE_SUCCESS,
        bucketId: bucketId
      });
      return this.loadBucketsForce();
    })
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_UNSHARE_ERROR,
          bucketId: bucketId
        });
        throw error;
      });
  },

  createTable: function(bucketId, params) {
    var self;
    self = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_CREATE,
      bucketId: bucketId,
      params: params
    });
    return storageApi.createTable(bucketId, params).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR,
            bucketId: bucketId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_SUCCESS,
          bucketId: bucketId
        });
        return self.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR,
          bucketId: bucketId,
          errors: error
        });
        throw message;
      });
  },

  restoreUsingTimeTravel: function(bucketId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL,
      bucketId: bucketId,
      tableId: params.sourceTableId,
      params: params
    });
    return storageApi.createTable(bucketId, params).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL_ERROR,
            bucketId: bucketId,
            tableId: params.sourceTableId,
            params: params,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL_SUCCESS,
          bucketId: bucketId,
          tableId: params.sourceTableId,
          params: params
        });
        return this.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_RESTORE_TIME_TRAVEL_ERROR,
          bucketId: bucketId,
          tableId: params.sourceTableId,
          params: params,
          errors: error
        });
        throw message;
      });
  },

  createTableFromSnapshot: function(bucketId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT,
      bucketId: bucketId,
      snapshotId: params.snapshotId,
      params: params
    });
    return storageApi.createTable(bucketId, params).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT_ERROR,
            bucketId: bucketId,
            snapshotId: params.snapshotId,
            params: params,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT_SUCCESS,
          bucketId: bucketId,
          snapshotId: params.snapshotId,
          params: params
        });
        return this.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_FROM_SNOPSHOT_ERROR,
          bucketId: bucketId,
          snapshotId: params.snapshotId,
          params: params,
          errors: error
        });
        throw message;
      });
  },

  truncateTable: function(tableId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TRUNCATE_TABLE,
      tableId: tableId
    });
    return storageApi.truncateTable(tableId).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TRUNCATE_TABLE_ERROR,
            tableId: tableId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TRUNCATE_TABLE_SUCCESS,
          tableId: tableId,
          response: response2
        });
        return this.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TRUNCATE_TABLE_ERROR,
          tableId: tableId,
          errors: error
        });
        throw message;
      });
  },

  deleteTable: function(tableId, force) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_DELETE_TABLE,
      tableId: tableId
    });
    return storageApi.deleteTable(tableId, { force }).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_DELETE_TABLE_SUCCESS,
        tableId: tableId
      });
      return ApplicationActionCreators.sendNotification({
        message: `Table ${tableId} has been removed`
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_DELETE_TABLE_ERROR,
          tableId: tableId,
          errors: error
        });
        throw error;
      });
  },

  createTableSync: function(bucketId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_CREATE,
      bucketId: bucketId
    });
    return storageApi.createTableSync(bucketId, params).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_CREATE_SUCCESS,
        bucketId: bucketId
      });
      return this.loadTablesForce();
    })
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR,
          bucketId: bucketId,
          errors: error
        });
        throw error;
      });
  },

  createAliasTable: function(bucketId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE,
      bucketId: bucketId,
      params: params
    });
    return storageApi.createAliasTable(bucketId, params).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_SUCCESS,
        bucketId: bucketId
      });
      return this.loadTablesForce();
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_ALIAS_TABLE_CREATE_ERROR,
          bucketId: bucketId,
          errors: error
        });
        throw message;
      });
  },

  loadTable: function(tableId, params) {
    var self;
    self = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_LOAD,
      params: params,
      tableId: tableId
    });
    return storageApi.loadTable(tableId, params).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR,
            tableId: tableId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_LOAD_SUCCESS,
          tableId: tableId,
          response: response2
        });
        return self.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR,
          tableId: tableId,
          errors: error
        });
        throw message;
      });
  },

  createTablePrimaryKey: function(tableId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY,
      params: params,
      tableId: tableId
    });
    return storageApi.createTablePrimaryKey(tableId, params).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY_ERROR,
            tableId: tableId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY_SUCCESS,
          tableId: tableId,
          response: response2
        });
        return this.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_SET_PRIMARY_KEY_ERROR,
          tableId: tableId,
          errors: error
        });
        throw message;
      });
  },

  removeTablePrimaryKey: function(tableId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY,
      tableId: tableId
    });
    return storageApi.removeTablePrimaryKey(tableId).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY_ERROR,
            tableId: tableId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY_SUCCESS,
          tableId: tableId,
          response: response2
        });
        return this.loadTablesForce();
      });
    })
      .catch(function(error) {
        var message;
        message = error;
        if (error.message) {
          message = error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_DELETE_PRIMARY_KEY_ERROR,
          tableId: tableId,
          errors: error
        });
        throw message;
      });
  },

  createSnapshot: function(tableId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT,
      tableId: tableId,
      params: params
    });
    return storageApi.createSnapshot(tableId, params).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          ApplicationActionCreators.sendNotification({
            message: response2.error.message,
            type: 'error',
            id: response2.error.exceptionId
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT_SUCCESS,
          tableId: tableId,
          params: params,
          response: response2
        });
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_CREATE_SNOPSHOT_ERROR,
        tableId: tableId,
        params: params
      });
      throw error;
    });
  },

  deleteSnapshot: function(snapshotId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT,
      snapshotId: snapshotId
    });
    return storageApi.deleteSnapshot(snapshotId).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          ApplicationActionCreators.sendNotification({
            message: response2.error.message,
            type: 'error',
            id: response2.error.exceptionId
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT_SUCCESS,
          snapshotId: snapshotId,
          response: response2
        });
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_REMOVE_SNOPSHOT_ERROR,
        snapshotId: snapshotId
      });
      throw error;
    });
  },

  loadDataIntoWorkspace: function(workspaceId, configuration) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_LOAD_DATA_INTO_WORKSPACE,
      configuration: configuration,
      workspaceId: workspaceId
    });
    return storageApi.loadDataIntoWorkspace(workspaceId, configuration).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          ApplicationActionCreators.sendNotification({
            message: response2.error.message,
            type: 'error',
            id: response2.error.exceptionId
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_LOAD_DATA_INTO_WORKSPACE_SUCCESS,
          workspaceId: workspaceId,
          response: response2
        });
        ApplicationActionCreators.sendNotification({
          message: 'Data successfully loaded into the sandbox'
        });
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_LOAD_DATA_INTO_WORKSPACE_ERROR,
        workspaceId: workspaceId
      });
      throw error;
    });
  },

  addTableColumn: function(tableId, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN,
      tableId: tableId,
      params: params
    });
    return storageApi.addTableColumn(tableId, params).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN_ERROR,
            tableId: tableId
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN_SUCCESS,
          tableId: tableId,
          params: params,
          response: response2
        });
        return this.loadTablesForce();
      });
    }).catch(function(error) {
      var message;
      message = error;
      if (error.message) {
        message = error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_ADD_TABLE_COLUMN_ERROR,
        tableId: tableId,
        params: params,
        errors: error
      });
      throw message;
    });
  },

  deleteTableColumn: function(tableId, columnName, params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN,
      tableId: tableId,
      columnName: columnName,
      params: params
    });
    return storageApi.deleteTableColumn(tableId, columnName, params).then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN_ERROR,
            tableId: tableId,
            columnName: columnName
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN_SUCCESS,
          tableId: tableId,
          columnName: columnName,
          response: response2
        });
        return this.loadTablesForce();
      });
    }).catch(function(error) {
      var message;
      message = error;
      if (error.message) {
        message = error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_DELETE_TABLE_COLUMN_ERROR,
        tableId: tableId,
        columnName: columnName,
        errors: error
      });
      throw message;
    });
  },

  uploadFile: function(id, file, params = {}) {
    const uploadParams = {
      federationToken: true,
      notify: false,
      isEncrypted: true,
      name: file.name,
      sizeBytes: file.size,
      ...params
    };

    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_FILE_UPLOAD,
      id: id,
      progress: 1
    });

    return storageApi.prepareFileUpload(uploadParams).then(response => {
      const fileId = response.id;

      const awsParams = {
        signatureVersion: 'v4',
        maxRetries: 0,
        region: response.region,
        httpOptions: {
          timeout: 0
        }
      };

      const s3params = {
        Key: response.uploadParams.key,
        Bucket: response.uploadParams.bucket,
        ACL: response.uploadParams.acl,
        ServerSideEncryption: response.uploadParams['x-amz-server-side-encryption'],
        Body: file
      };

      AWS.config.setPromisesDependency(Promise);
      AWS.config.credentials = new AWS.Credentials({
        accessKeyId: response.uploadParams.credentials.AccessKeyId,
        secretAccessKey: response.uploadParams.credentials.SecretAccessKey,
        sessionToken: response.uploadParams.credentials.SessionToken
      });

      const reportProgress = _.throttle((progress) => {
        const percent = Math.max(1, Math.round(100 * (progress.loaded / progress.total)));

        if (percent < 100) {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_FILE_UPLOAD,
            id: id,
            progress: percent
          });
        }
      }, 800);

      return new AWS.S3(awsParams)
        .putObject(s3params)
        .on('httpUploadProgress', reportProgress)
        .promise().then(() => {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_FILE_UPLOAD_SUCCESS,
            id: id
          });
          return fileId;
        });
    }).catch(error => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILE_UPLOAD_ERROR,
        id: id
      });
      throw error;
    });
  },

  deleteFile: function(fileId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_FILE_DELETE,
      fileId: fileId
    });
    return storageApi.deleteFile(fileId).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILE_DELETE_SUCCESS,
        fileId: fileId
      });
      ApplicationActionCreators.sendNotification({
        message: 'File has been removed.'
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILE_DELETE_ERROR,
        fileId: fileId
      });
      throw error;
    });
  },

  loadJobs: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_JOBS_LOAD
    });
    return storageApi.getJobs(params).then(function(jobs) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_JOBS_LOAD_SUCCESS,
        jobs: jobs
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_JOBS_LOAD_ERROR,
          errors: error
        });
        throw error;
      });
  },

  loadMoreJobs: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_JOBS_LOAD_MORE
    });
    return storageApi.getJobs(params).then(function(jobs) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_JOBS_LOAD_MORE_SUCCESS,
        jobs: jobs
      });
    })
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_JOBS_LOAD_MORE_ERROR,
          errors: error
        });
        throw error;
      });
  }
};
