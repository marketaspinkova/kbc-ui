import loadType from './loadType';
import changedSinceConstants from '../../../react/common/changedSinceConstants';

export const cases = {
  emptyWithDefaults: {
    localState: {
      source: '',
      loadType: loadType.loadTypes.FULL,
      changedSince: ''
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              changed_since: ''
            }
          ]
        }
      },
      parameters: {
        tables: [
          {
            incremental: false
          }
        ]
      }
    }
  },
  simple: {
    localState: {
      source: '',
      loadType: loadType.loadTypes.INCREMENTAL,
      changedSince: '-1 day'
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              changed_since: '-1 day'
            }
          ]
        }
      },
      parameters: {
        tables: [
          {
            incremental: true
          }
        ]
      }
    }
  },
  adaptive: {
    localState: {
      source: '',
      loadType: loadType.loadTypes.ADAPTIVE,
      changedSince: ''
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              changed_since: changedSinceConstants.ADAPTIVE_VALUE
            }
          ]
        }
      },
      parameters: {
        tables: [
          {
            incremental: true
          }
        ]
      }
    }
  }
};

