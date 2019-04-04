export const cases = {
  emptyWithDefaults: {
    localState: {
      source: '',
      incremental: false,
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
      incremental: true,
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
  }
};

