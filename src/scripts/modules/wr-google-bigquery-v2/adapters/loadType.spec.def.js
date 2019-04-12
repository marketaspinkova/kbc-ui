import loadType from './loadType';

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
              changed_since: 'adaptive'
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

