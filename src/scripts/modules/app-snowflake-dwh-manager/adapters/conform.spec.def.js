export default {
  willConvertLegacyFormatToNewFormat: {
    sourceConfig: {
      parameters: {
        user: {
          email: '',
          business_schemas: [
            'accounting', 'sales'
          ],
          disabled: false
        }
      }
    },
    expectedConfig: {
      parameters: {
        user: {
          email: '',
          schemas: [
            {'name': 'accounting', 'permission': 'read'},
            {'name': 'sales', 'permission': 'read'}
          ],
          disabled: false
        }
      }
    }
  },
  willNotTouchNewFormat: {
    sourceConfig: {
      parameters: {
        user: {
          email: '',
          schemas: [
            {'name': 'accounting', 'permission': 'read'},
            {'name': 'sales', 'permission': 'read'}
          ],
          disabled: false
        }
      }
    },
    expectedConfig: {
      parameters: {
        user: {
          email: '',
          schemas: [
            {'name': 'accounting', 'permission': 'read'},
            {'name': 'sales', 'permission': 'read'}
          ],
          disabled: false
        }
      }
    }
  }
};
