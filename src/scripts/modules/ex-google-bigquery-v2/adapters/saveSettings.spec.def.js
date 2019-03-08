export const cases = {
  emptyWithDefaults: {
    localState: {
      tableName: '',
      incremental: false,
      primaryKey: []
    },
    configuration: {
      parameters: {
        query: {
          tableName: '',
          incremental: false,
          primaryKey: []
        }
      }
    }
  },
  simple: {
    localState: {
      tableName: 'dailyStats',
      incremental: true,
      primaryKey: [
        'id',
        'name'
      ]
    },
    configuration: {
      parameters: {
        query: {
          tableName: 'dailyStats',
          incremental: true,
          primaryKey: [
            'id',
            'name'
          ]
        }
      }
    }
  }
};

