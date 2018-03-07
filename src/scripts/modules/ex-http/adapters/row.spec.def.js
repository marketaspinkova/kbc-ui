const cases = {
  emptyWithDefaults: {
    localState: {
      path: '',
      name: '',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: '',
        saveAs: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: []
            }
          }
        ]
      }
    }
  },
  simple: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: ['col1'],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: ['col1'],
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  incremental: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: true,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: true,
              primary_key: [],
              columns: []
            }
          }
        ]
      }
    }
  },
  primaryKey: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: ['col'],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: ['col'],
              columns: []
            }
          }
        ]
      }
    }
  },
  delimiter: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ';',
      enclosure: '"',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ';',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: []
            }
          }
        ]
      }
    }
  },
  tabDelimiter: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: '\t',
      enclosure: '"',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: '\t',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: []
            }
          }
        ]
      }
    }
  },
  enclosure: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
              columns: []
            }
          }
        ]
      }
    }
  },
  manualColumns: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  autoColumns: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'auto',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
              columns: [],
              columns_from: 'auto'
            }
          }
        ]
      }
    }
  },
  headerColumns: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'header',
      decompress: false
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
              columns: [],
              columns_from: 'header'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    }
  },
  decompress: {
    localState: {
      path: 'mykey',
      name: 'mytable',
      incremental: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'header',
      decompress: true
    },
    configuration: {
      parameters: {
        path: 'mykey',
        saveAs: 'mytable'
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-decompress'
            }
          },
          {
            definition: {
              component: 'keboola.processor-flatten-folders'
            },
            parameters: {
              starting_depth: 1
            }
          },
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
              columns: [],
              columns_from: 'header'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    }
  }
};

module.exports = {
  cases: cases
};
