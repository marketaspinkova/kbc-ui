export const cases = {
  'emptyConfig': {
    'localState': {
      'addFilenameColumn': false,
      'addRowNumberColumn': false,
      'columns': [],
      'columnsFrom': 'header',
      'decompress': false,
      'delimiter': ',',
      'enclosure': '\"',
      'incremental': false,
      'name': '',
      'onlyNewFiles': '',
      'path': '',
      'primaryKey': []
    },
    'configuration': {
      'parameters': {
        'onlyNewFiles': false,
        'path': ''
      },
      'processors':

        {
          'after': [
            {
              'definition': {
                'component': 'keboola.processor-move-files'
              },
              'parameters': {
                'addCsvSuffix': true,
                'direction': 'tables',
                'folder': ''
              }
            },
            {
              'definition': {
                'component': 'keboola.processor-create-manifest'
              },
              'parameters': {
                'columns_from': 'header',
                'delimiter': ',',
                'enclosure': '"',
                'incremental': false,
                'primary_key': []
              }
            },
            {
              'definition': {
                'component': 'keboola.processor-skip-lines'
              },
              'parameters': {
                'lines': 1
              }
            }
          ]
        }
    }
  },
  'simpleConfig': {
    'localState': {
      'addFilenameColumn': false,
      'addRowNumberColumn': false,
      'columns': [],
      'columnsFrom': 'header',
      'decompress': false,
      'delimiter': '#',
      'enclosure': '\"',
      'incremental': false,
      'name': '',
      'onlyNewFiles': true,
      'path': '/destination',
      'primaryKey': []
    },
    'configuration': {
      'parameters': {
        'onlyNewFiles': true,
        'path': '/destination'
      },
      'processors':

        {
          'after': [
            {
              'definition': {
                'component': 'keboola.processor-move-files'
              },
              'parameters': {
                'addCsvSuffix': true,
                'direction': 'tables',
                'folder': ''
              }
            },
            {
              'definition': {
                'component': 'keboola.processor-create-manifest'
              },
              'parameters': {
                'columns_from': 'header',
                'delimiter': '#',
                'enclosure': '"',
                'incremental': false,
                'primary_key': []
              }
            },
            {
              'definition': {
                'component': 'keboola.processor-skip-lines'
              },
              'parameters': {
                'lines': 1
              }
            }
          ]
        }
    }
  }
};