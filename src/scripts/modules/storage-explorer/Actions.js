import StorageActionCreators from '../components/StorageActionCreators';
import RoutesStore from '../../stores/RoutesStore';

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

export {
  deleteBucket,
  navigateToBucketDetail
};
