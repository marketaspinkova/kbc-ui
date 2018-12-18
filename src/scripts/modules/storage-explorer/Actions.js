import StorageActionCreators from '../components/StorageActionCreators';
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


export {
  deleteBucket,
  navigateToBucketDetail,
  createTablePrimaryKey,
  removeTablePrimaryKey
};
