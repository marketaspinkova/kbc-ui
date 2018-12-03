import StorageActionCreators from '../components/StorageActionCreators';
import RoutesStore from '../../stores/RoutesStore';

const deleteBucket = (bucketId, forceDelete) => {
  return StorageActionCreators
    .deleteBucket(bucketId, forceDelete)
    .then(() => {
      RoutesStore.getRouter().transitionTo('storage-explorer');
    });
};

export {
  deleteBucket
};
