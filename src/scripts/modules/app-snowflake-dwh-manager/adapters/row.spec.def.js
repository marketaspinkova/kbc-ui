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
    },
    context: { rows: [] }
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
    },
    context: { rows: [] }
  },
  user: {
    localState: {
      type: 'user',
      email: 'tomas.fejfar@keboola.com',
      schemas_read: ['accounting', 'sales'],
      schemas_write: [],
      disabled: false,
      existingSchemas: []
    },
    configuration: {
      parameters: {
        user: {
          email: 'tomas.fejfar@keboola.com',
          business_schemas: ['accounting', 'sales'],
          disabled: false
        }
      }
    },
    context: { rows: [] }
  },
  userEmailEmptyString: {
    localState: {
      type: 'user',
      email: '',
      schemas_read: ['accounting', 'sales'],
      schemas_write: [],
      disabled: false,
      existingSchemas: [
        {
          value: 'accounting',
          label: 'accounting'
        },
        {
          value: 'dev',
          label: 'dev'
        }
      ]
    },
    configuration: {
      parameters: {
        user: {
          email: '',
          business_schemas: ['accounting', 'sales'],
          disabled: false
        }
      }
    },
    context: {
      rows: [
        {
          parameters: {
            business_schema: {
              schema_name: 'accounting'
            }
          }
        },
        {
          parameters: {
            business_schema: {
              schema_name: 'dev'
            }
          }
        }
      ]
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
      disabled: false,
      existingSchemas: []
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
    },
    context: { rows: [] }
  },
  emptyReadSchemas: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: [],
      schemas_write: ['accounting', 'sales'],
      disabled: false,
      existingSchemas: []
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
    },
    context: { rows: [] }
  },
  combinationOfReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['accounting', 'sales'],
      schemas_write: ['development', 'local'],
      disabled: false,
      existingSchemas: []
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
    },
    context: { rows: [] }
  },
  emptyReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: [],
      schemas_write: [],
      disabled: false,
      existingSchemas: []
    },
    configuration: {
      parameters: {
        user: {
          email: 'dev@keboola.com',
          schemas: [],
          disabled: false
        }
      }
    },
    context: { rows: [] }
  }
};

const mixedCasesFromConfiguration = {
  mixedOldAndNew: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['development', 'accounting', 'sales'],
      schemas_write: ['local'],
      disabled: false,
      existingSchemas: []
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
    },
    context: { rows: [] }
  }
};

const mixedCasesFromLocalstate = {
  mixedReadAndWrite: {
    localState: {
      type: 'user',
      email: 'dev@keboola.com',
      schemas_read: ['accounting', 'sales', 'development'],
      schemas_write: ['local'],
      disabled: false,
      existingSchemas: []
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
    },
    context: { rows: [] }
  }
};

export default {
  originalCasesForParseConfiguration,
  newCases,
  mixedCasesFromConfiguration,
  mixedCasesFromLocalstate
};
