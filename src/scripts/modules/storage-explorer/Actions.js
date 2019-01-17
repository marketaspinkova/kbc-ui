import dispatcher from '../../Dispatcher';
import * as constants from '../components/Constants';
import * as localConstants from './Constants';
import StorageActionCreators from '../components/StorageActionCreators';
import StorageApi from '../components/StorageApi';
import ApplicationStore from '../../stores/ApplicationStore';
import jobPoller from '../../utils/jobPoller';
import exportTableApi from './ExportTableApi';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import HttpError from '../../utils/HttpError';

const errorNotification = (message) => {
  ApplicationActionCreators.sendNotification({
    type: 'error',
    message: message
  });
};

const deleteBucket = (bucketId, forceDelete) => {
  return StorageActionCreators.deleteBucket(bucketId, forceDelete).then(() => {
    RoutesStore.getRouter().transitionTo('storage-explorer');
  });
};

const deleteTable = (bukcetId, tableId, forceDelete) => {
  return StorageActionCreators.deleteTable(tableId, forceDelete).then(() => {
    navigateToBucketDetail(bukcetId);
  });
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

const updateSearchQuery = query => {
  return dispatcher.handleViewAction({
    type: localConstants.ActionTypes.UPDATE_SEARCH_QUERY,
    query
  });
};

const resetSearchQuery = () => {
  updateSearchQuery('');
};

export {
  deleteBucket,
  deleteTable,
  navigateToBucketDetail,
  createTablePrimaryKey,
  removeTablePrimaryKey,
  deleteTableColumn,
  addTableColumn,
  dataPreview,
  createTableFromSnapshot,
  restoreUsingTimeTravel,
  truncateTable,
  createTableFromTextInput,
  exportTable,
  loadFiles,
  loadMoreFiles,
  updateSearchQuery,
  resetSearchQuery
};
