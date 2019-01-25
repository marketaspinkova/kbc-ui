const originalCasesForParseConfiguration = {
  schema: {
    localState: {
      type: 'schema',
      schema_name: 'accounting'
    },
    configuration: {
      parameters: {
        business_schema: {
          schema_name: 'accounting'
        }
      }
    }
  },
  schemaNameEmptyString: {
    localState: {
      type: 'schema',
      schema_name: ''
    },
    configuration: {
      parameters: {
        business_schema: {
          schema_name: ''
        }
      }
    }
  },
  user: {
    localState: {
      type: 'user',
      email: 'tomas.fejfar@keboola.com',
      schemas_read: ['accounting', 'sales'],
      schemas_write: [],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'tomas.fejfar@keboola.com',
          business_schemas: ['accounting', 'sales'],
          disabled: false
        }
      }
    }
  },
  userEmailEmptyString: {
    localState: {
      type: 'user',
      email: '',
      schemas_read: ['accounting', 'sales'],
      schemas_write: [],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: '',
          business_schemas: ['accounting', 'sales'],
          disabled: false
        }
      }
    }
  }
};

const newCases = {
  emptyWriteSchemas: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['accounting', 'sales'],
      schemas_write: [],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [
            { name: 'accounting', permission: 'read' },
            { name: 'sales', permission: 'read' }
          ],
          disabled: false
        }
      }
    }
  },
  emptyReadSchemas: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: [],
      schemas_write: ['accounting', 'sales'],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [
            { name: 'accounting', permission: 'write' },
            { name: 'sales', permission: 'write' }
          ],
          disabled: false
        }
      }
    }
  },
  combinationOfReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['accounting', 'sales'],
      schemas_write: ['development', 'local'],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [
            { name: 'accounting', permission: 'read' },
            { name: 'sales', permission: 'read' },
            { name: 'development', permission: 'write' },
            { name: 'local', permission: 'write' }
          ],
          disabled: false
        }
      }
    }
  },
  emptyReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: [],
      schemas_write: [],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [],
          disabled: false
        }
      }
    }
  }
};

const mixedCasesFromConfiguration = {
  mixedOldAndNew: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['development', 'accounting', 'sales'],
      schemas_write: ['local'],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          business_schemas: ['accounting', 'sales'],
          schemas: [
            { name: 'development', permission: 'read' },
            { name: 'local', permission: 'write' }
          ],
          disabled: false
        }
      }
    }
  }
};

const mixedCasesFromLocalstate = {
  mixedReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['accounting', 'sales', 'development'],
      schemas_write: ['local'],
      disabled: false
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [
            { name: 'accounting', permission: 'read' },
            { name: 'sales', permission: 'read' },
            { name: 'development', permission: 'read' },
            { name: 'local', permission: 'write' }
          ],
          disabled: false
        }
      }
    }
  }
};

export default {
  originalCasesForParseConfiguration,
  newCases,
  mixedCasesFromConfiguration,
  mixedCasesFromLocalstate
};
