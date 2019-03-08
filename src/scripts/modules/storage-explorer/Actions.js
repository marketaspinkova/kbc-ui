import Promise from 'bluebird';
import _ from 'underscore';
import dispatcher from '../../Dispatcher';
import * as constants from '../components/Constants';
import * as localConstants from './Constants';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationStore from '../../stores/ApplicationStore';
import StorageActionCreators from '../components/StorageActionCreators';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import jobPoller from '../../utils/jobPoller';
import HttpError from '../../utils/errors/HttpError';
import StorageApi from '../components/StorageApi';
import exportTableApi from './ExportTableApi';

const errorNotification = (message) => {
  if (!_.isString(message)) {
    throw message;
  }

  ApplicationActionCreators.sendNotification({
    type: 'error',
    message: message
  });
};

const reload = () => {
  dispatcher.handleViewAction({
    type: localConstants.ActionTypes.RELOAD
  });
  return Promise.all([
    StorageActionCreators.loadBucketsForce(),
    StorageActionCreators.loadTablesForce(),
    StorageActionCreators.sharedBuckets()
  ])
    .then(() => {
      dispatcher.handleViewAction({
        type: localConstants.ActionTypes.RELOAD_SUCCESS
      });
    }).catch(() => {
      dispatcher.handleViewAction({
        type: localConstants.ActionTypes.RELOAD_ERROR
      });
    });
};

const tokenVerify = () => {
  if (ApplicationStore.getSapiToken().has('bucketPermissions')) {
    return Promise.resolve();
  }

  return StorageActionCreators.tokenVerify();
};

const loadJobs = (params) => {
  return StorageActionCreators.loadJobs(params);
};

const loadMoreJobs = (params) => {
  return StorageActionCreators.loadMoreJobs(params);
};

const loadBuckets = () => {
  return StorageActionCreators.loadBuckets();
};

const loadSharedBuckets = () => {
  return StorageActionCreators.sharedBuckets();
};

const loadTable = (tableId, params) => {
  return StorageActionCreators.loadTable(tableId, params);
};

const loadTables = () => {
  return StorageActionCreators.loadTables();
};

const createBucket = (newBucket) => {
  return StorageActionCreators
    .createBucket(newBucket)
    .then(bucket => StorageActionCreators.tokenVerify().then(() => bucket.id))
    .then(bucketId => {
      navigateToBucketDetail(bucketId);
    });
};

const deleteBucket = (bucketId, forceDelete) => {
  return StorageActionCreators.deleteBucket(bucketId, forceDelete).then(() => {
    RoutesStore.getRouter().transitionTo('storage-explorer');
  });
};

const createTable = (bucketId, params) => {
  return StorageActionCreators.createTable(bucketId, params);
};

const deleteTable = (bukcetId, tableId, forceDelete) => {
  return StorageActionCreators.deleteTable(tableId, forceDelete).then(() => {
    navigateToBucketDetail(bukcetId);
  });
};

const createAliasTable = (bucketId, params) => {
  return StorageActionCreators.createAliasTable(bucketId, params);
};

const navigateToBucketDetail = bucketId => {
  RoutesStore.getRouter().transitionTo('storage-explorer-bucket', {
    bucketId: bucketId
  });
};

const createTablePrimaryKey = (tableId, params) => {
  return StorageActionCreators
    .createTablePrimaryKey(tableId, params)
    .catch(errorNotification);
};

const removeTablePrimaryKey = (tableId) => {
  return StorageActionCreators
    .removeTablePrimaryKey(tableId)
    .catch(errorNotification);
};

const deleteTableColumn = (tableId, columnName, params) => {
  return StorageActionCreators
    .deleteTableColumn(tableId, columnName, params)
    .catch(errorNotification);
};

const addTableColumn = (tableId, params) => {
  return StorageActionCreators
    .addTableColumn(tableId, params)
    .catch(errorNotification);
};

const setAliasTableFilter = (tableId, params) => {
  return StorageActionCreators
    .setAliasTableFilter(tableId, params)
    .catch(HttpError, error => {
      throw error.message;
    });
};

const removeAliasTableFilter = (tableId) => {
  return StorageActionCreators
    .removeAliasTableFilter(tableId)
    .catch(HttpError, error => {
      throw error.message;
    });
};

const dataPreview = (tableId, params) => {
  return StorageApi
    .tableDataJsonPreview(tableId, { limit: 20, ...params })
    .catch(HttpError, error => {
      throw error.message;
    });
};

const createTableFromSnapshot = (bucketId, params) => {
  return StorageActionCreators
    .createTableFromSnapshot(bucketId, params)
    .catch(errorNotification);
};

const createTableFromTextInput = (bucketId, params) => {
  return StorageActionCreators
    .createTableSync(bucketId, params)
    .catch(HttpError, (error) => {
      throw error.message;
    });
};

const restoreUsingTimeTravel = (bucketId, params) => {
  return StorageActionCreators
    .restoreUsingTimeTravel(bucketId, params)
    .catch(errorNotification);
};

const truncateTable = (tableId) => {
  return StorageActionCreators
    .truncateTable(tableId)
    .then(() => {
      ApplicationActionCreators.sendNotification({
        message: `Table ${tableId} has been truncated.`
      });
    })
    .catch(errorNotification);
};

const exportTable = tableId => {
  dispatcher.handleViewAction({
    type: constants.ActionTypes.STORAGE_TABLE_EXPORT,
    tableId: tableId
  });
  return exportTableApi
    .export(tableId)
    .then(response => {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(response2 => {
        if (response2.status === 'error') {
          throw response2.error;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_EXPORT_SUCCESS,
          tableId: tableId
        });
        return response2;
      });
    })
    .catch(error => {
      const message = error.message ? error.message : error;
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_EXPORT_ERROR,
        tableId: tableId
      });
      throw message;
    });
};

const createSnapshot = (tableId, params) => {
  return StorageActionCreators.createSnapshot(tableId, params);
};

const deleteSnapshot = (snapshotId) => {
  return StorageActionCreators.deleteSnapshot(snapshotId);
};

const shareBucket = (bucketId, params) => {
  return StorageActionCreators.shareBucket(bucketId, params).then(loadSharedBuckets);
};

const changeBucketSharingType = (bucketId, params) => {
  return StorageActionCreators.changeBucketSharingType(bucketId, params);
};

const unshareBucket = (bucketId) => {
  return StorageActionCreators.unshareBucket(bucketId).then(loadSharedBuckets);
};

const uploadFile = (id, file, params) => {
  return StorageActionCreators.uploadFile(id, file, params);
};

const deleteFile = (fileId) => {
  return StorageActionCreators
    .deleteFile(fileId)
    .catch(HttpError, error => {
      throw error.message;
    })
    .catch(errorNotification);
};

const loadFiles = params => {
  return StorageActionCreators
    .loadFilesForce(params)
    .catch(HttpError, error => {
      throw error.message;
    })
    .catch(errorNotification);
};

const loadMoreFiles = params => {
  return StorageActionCreators
    .loadMoreFiles(params)
    .catch(HttpError, error => {
      throw error.message;
    })
    .catch(errorNotification);
};

const filterFiles = query => {
  const queryParams = query ? {q: query} : {};
  RoutesStore.getRouter().transitionTo('storage-explorer-files', null, queryParams);
};

const updateSearchQuery = query => {
  dispatcher.handleViewAction({
    type: localConstants.ActionTypes.UPDATE_SEARCH_QUERY,
    query
  });
};

const updateFilesSearchQuery = query => {
  dispatcher.handleViewAction({
    type: localConstants.ActionTypes.UPDATE_FILES_SEARCH_QUERY,
    query
  });
};

const setOpenedBuckets = buckets => {
  dispatcher.handleViewAction({
    type: localConstants.ActionTypes.SET_OPENED_BUCKETS,
    buckets
  });
};

const setOpenedColumns = columns => {
  return dispatcher.handleViewAction({
    type: localConstants.ActionTypes.SET_OPENED_COLUMNS,
    columns
  });
};

const resetFilesSearchQuery = () => {
  updateFilesSearchQuery('');
};

export {
  reload,
  tokenVerify,
  loadJobs,
  loadMoreJobs,
  loadBuckets,
  loadSharedBuckets,
  loadTable,
  loadTables,
  createBucket,
  deleteBucket,
  createTable,
  deleteTable,
  createAliasTable,
  navigateToBucketDetail,
  createTablePrimaryKey,
  removeTablePrimaryKey,
  deleteTableColumn,
  addTableColumn,
  setAliasTableFilter,
  removeAliasTableFilter,
  dataPreview,
  createTableFromSnapshot,
  restoreUsingTimeTravel,
  truncateTable,
  createTableFromTextInput,
  exportTable,
  createSnapshot,
  deleteSnapshot,
  shareBucket,
  unshareBucket,
  changeBucketSharingType,
  uploadFile,
  deleteFile,
  loadFiles,
  loadMoreFiles,
  updateSearchQuery,
  updateFilesSearchQuery,
  resetFilesSearchQuery,
  setOpenedBuckets,
  setOpenedColumns,
  filterFiles
};
