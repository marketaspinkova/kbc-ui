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

export const casesWithIncrement = {
  disable: {
    oldLocalState: {
      destination: 'Test',
      incremental: false
    },
    newLocalState: {
      destination: 'Test',
      mode: 'replace'
    },
    oldConfiguration: {
      storage: {
        input: {
          tables: [
            {
              destination: 'Test'
            }
          ]
        }
      },
      parameters: {
        incremental: false
      }
    },
    newConfiguration: {
      storage: {
        input: {
          tables: [
            {
              destination: 'Test'
            }
          ]
        }
      },
      parameters: {
        mode: 'replace'
      }
    }
  },

  enable: {
    oldLocalState: {
      destination: 'Test',
      incremental: true
    },
    newLocalState: {
      destination: 'Test',
      mode: 'update'
    },
    oldConfiguration: {
      storage: {
        input: {
          tables: [
            {
              destination: 'Test'
            }
          ]
        }
      },
      parameters: {
        incremental: true
      }
    },
    newConfiguration: {
      storage: {
        input: {
          tables: [
            {
              destination: 'Test'
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
