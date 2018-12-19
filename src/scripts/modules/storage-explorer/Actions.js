import StorageActionCreators from '../components/StorageActionCreators';
import StorageApi from '../components/StorageApi';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';

const errorNotification = (message) => {
  ApplicationActionCreators.sendNotification({
    type: 'error',
    message: message
  });
};

const deleteBucket = (bucketId, forceDelete) => {
  return StorageActionCreators
    .deleteBucket(bucketId, forceDelete)
    .then(() => {
      RoutesStore.getRouter().transitionTo('storage-explorer');
    });
};

const navigateToBucketDetail = (bucketId) => {
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
    .tableDataPreview(tableId, { limit: 20, ...params })
    .catch(error => {
      if (!error.response || !error.response.body) {
        throw new Error(JSON.stringify(error));
      }

      if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
        return 'Data sample cannot be displayed. Too many columns.';
      }

      return error.response.body.message;
    });
};

export {
  deleteBucket,
  navigateToBucketDetail,
  createTablePrimaryKey,
  removeTablePrimaryKey,
  deleteTableColumn,
  addTableColumn,
  dataPreview
};
