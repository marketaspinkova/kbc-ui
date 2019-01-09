export const cases = {
  emptyWithDefaults: {
    localState: {
      destination: '',
      mode: 'replace'
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              destination: ''
            }
          ]
        }
      },
      parameters: {
        mode: 'replace'
      }
    }
  },

  simple: {
    localState: {
      destination: 'test',
      mode: 'update'
    },
    configuration: {
      storage: {
        input: {
          tables: [
            {
              destination: 'test'
            }
          ]
        }
      },
      parameters: {
        mode: 'update'
      }
    }
  }
};