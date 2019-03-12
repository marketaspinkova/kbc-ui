export const cases = {
  emptyWithDefaults: {
    localState: {
      query: '',
      useLegacySql: true
    },
    configuration: {
      parameters: {
        query: {
          query: '',
          useLegacySql: true
        }
      }
    }
  },
  simple: {
    localState: {
      query: 'SELECT * FROM myTable;',
      useLegacySql: false
    },
    configuration: {
      parameters: {
        query: {
          query: 'SELECT * FROM myTable;',
          useLegacySql: false
        }
      }
    }
  }
};

