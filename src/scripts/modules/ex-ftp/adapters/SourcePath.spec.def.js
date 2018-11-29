export const cases = {
  emptyWithDefaults: {
    localState: {
      path: '',
      name: '',
      incremental: false,
      onlyNewFiles: false,
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
        path: '',
        onlyNewFiles: false
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
              columns_from: 'header',
              primary_key: []
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
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: ['col1']
            }
          }
        ]
      }
    }
  },
  wildcard: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  subfolders: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  incremental: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: true,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  onlyNewFiles: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: true,
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
        path: 'mypath',
        onlyNewFiles: true
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  primaryKey: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: ['col']
            }
          }
        ]
      }
    }
  },
  delimiter: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  tabDelimiter: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  enclosure: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  manualColumns: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns: ['col1', 'col2'],
              primary_key: []
            }
          }
        ]
      }
    }
  },
  autoColumns: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns_from: 'auto',
              primary_key: []
            }
          }
        ]
      }
    }
  },
  headerColumns: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns_from: 'header',
              primary_key: []
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
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '\'',
              incremental: false,
              columns_from: 'header',
              primary_key: []
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
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns_from: 'header',
              primary_key: []
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
              column_name: 'ftp_row_number'
            }
          }
        ]
      }
    }

  },
  addFilenameColumn: {
    localState: {
      path: 'mypath',
      name: 'mytable',
      incremental: false,
      onlyNewFiles: false,
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
        path: 'mypath',
        onlyNewFiles: false
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
              columns_from: 'header',
              primary_key: []
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
              column_name: 'ftp_filename'
            }
          }
        ]
      }
    }
  }
};