import {DatasetLocations} from "./../helpers/constants";

export const cases = {
  emptyWithDefaults: {
    localState: {
      storage: '',
      location: DatasetLocations.MULTI_REGION_US
    },
    configuration: {
      parameters: {
        google: {
          storage: '',
          location: DatasetLocations.MULTI_REGION_US
        }
      }
    }
  },
  simple: {
    localState: {
      storage: 'gs://my-cloud-storage-bucke',
      location: 'EU'
    },
    configuration: {
      parameters: {
        google: {
          storage: 'gs://my-cloud-storage-bucke',
          location: 'EU'
        }
      }
    }
  }
};

