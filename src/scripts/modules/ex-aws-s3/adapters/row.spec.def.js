export const cases = {
  emptyWithDefaults: {
    localState: {
      bucket: '',
      key: '',
      name: '',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'header',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: ['col1'],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: true,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: true,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: true,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
              incremental: true,
              primary_key: [],
              columns: ['col1', 'col2']
            }
          }
        ]
      }
    }
  },
  newFilesOnly: {
    localState: {
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: true,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
              incremental: false,
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: ['col'],
      delimiter: ',',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ';',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: '\t',
      enclosure: '"',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
  manualColumns: {
    localState: {
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: ['col1', 'col2'],
      columnsFrom: 'manual',
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
  autoColumns: {
    localState: {
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'auto',
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
              columns_from: 'auto'
            }
          }
        ]
      }
    }
  },
  headerColumns: {
    localState: {
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'header',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '\'',
      columns: [],
      columnsFrom: 'header',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'header',
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
      bucket: 'mybucket',
      key: 'mykey',
      name: 'mytable',
      wildcard: false,
      subfolders: false,
      incremental: false,
      newFilesOnly: false,
      primaryKey: [],
      delimiter: ',',
      enclosure: '"',
      columns: [],
      columnsFrom: 'header',
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
