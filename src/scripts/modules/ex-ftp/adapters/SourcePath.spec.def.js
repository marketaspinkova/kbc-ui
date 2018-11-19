export const cases = {
  'emptyConfig': {
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
  },
  'emptyState': {
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
  }
};