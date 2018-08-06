export const cases = {
  emptyWithDefaults: {
    localState: {
      type: 'full',
      bucket: '',
      key: '',
      name: '',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: '',
        key: '',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: ''
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
  simple: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: ['col1'],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
  wildcard: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: true,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey*',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  subfolders: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: true,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: true,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  incremental: {
    localState: {
      type: 'incremental',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: true
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
  incrementalHeadless: {
    localState: {
      type: 'incremental-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: true
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  primaryKey: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: ['col'],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  delimiter: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ';',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  tabDelimiter: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: '\t',
      enclosure: '"',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  enclosure: {
    localState: {
      type: 'full-headless',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: ['col1', 'col2'],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
  decompress: {
    localState: {
      type: 'full',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      decompress: true,
      addRowNumberColumn: false,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
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
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              primary_key: [],
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
  addRowNumberColumn: {
    localState: {
      type: 'full',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      decompress: false,
      addRowNumberColumn: true,
      addFilenameColumn: false
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
          },
          {
            definition: {
              component: 'keboola.processor-add-row-number-column'
            },
            parameters: {
              column_name: 's3_row_number'
            }
          }
        ]
      }
    }

  },
  addFilenameColumn: {
    localState: {
      type: 'full',
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      decompress: false,
      addRowNumberColumn: false,
      addFilenameColumn: true
    },
    configuration: {
      parameters: {
        bucket: 'mybucket',
        key: 'mykey',
        includeSubfolders: false,
        newFilesOnly: false
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              addCsvSuffix: true,
              folder: 'mytable'
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
          },
          {
            definition: {
              component: 'keboola.processor-add-filename-column'
            },
            parameters: {
              column_name: 's3_filename'
            }
          }
        ]
      }
    }
  }
};
