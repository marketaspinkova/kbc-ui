export const cases = {
  emptyWithDefaults: {
    localState: {
      destination: '',
      source: ''
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              source: '',
              destination: ''
            }
          ]
        }
      },
      parameters: {
        tables: [
          {
            dbName: '',
            tableId: ''
          }
        ]
      }
    }
  },
  simple: {
    localState: {
      destination: 'test',
      source: 'in.c-main.test'
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              source: 'in.c-main.test',
              destination: 'in.c-main.test.csv'
            }
          ]
        }
      },
      parameters: {
        tables: [
          {
            dbName: 'test',
            tableId: 'in.c-main.test'
          }
        ]
      }
    }
  }
};

