import assert from 'assert';
import prepareColumnContext from './prepareColumnContext';
import {fromJS, Map, List} from 'immutable';

const sectionContext = fromJS({
  table: {
    id: 'in.some.table'
  },
  configuration: {
    parameters: {
      dimensions: {
        dim1: {
          identifier: 'foo'
        },
        dim2: {
          identifier: 'foo'
        },
        dim3: {
          identifier: 'foo'
        }
      }
    }
  },
  rows: [
    {
      parameters: {
        tables: {
          'in.some.table': {
            columns: {
              id: {
                type: 'CONNECTION_POINT',
                title: 'id'
              }
            }
          }
        }
      }
    },
    {
      parameters: {
        tables: {
          'in.OTHER.TABLE': {
            columns: {
              id: {
                type: 'CONNECTION_POINT',
                title: 'id'
              },
              name: {
                type: 'ATTRIBUTE',
                title: 'name'
              },
              refColumn: {
                type: 'LABEL',
                title: 'refColumn',
                reference: 'name'
              }
            }
          }
        }
      }
    }
  ]
});

const allColumns = fromJS([
  {
    id: 'id',
    type: 'CONNECTION_POINT',
    title: 'id'

  },
  {
    type: 'ATTRIBUTE',
    id: 'city',
    title: 'city'
  },
  {
    id: 'refColumn',
    type: 'LABEL',
    title: 'refColumn',
    reference: 'name'
  }
]);

describe('prepareColumnContext tests', () => {
  it('should pass empty', () => {
    const columnContext = prepareColumnContext(Map(), List());
    assert.deepEqual(
      columnContext.toJS(),
      {
        referencableTables: [],
        referencableColumns: [],
        sortLabelsColumns: {},
        dimensions: []
      }
    );
  });

  it('should pass with some context and columns', () => {
    const columnContext = prepareColumnContext(sectionContext, allColumns);
    assert.deepEqual(
      columnContext.toJS(),
      {
        referencableTables: [
          'in.OTHER.TABLE'
        ],
        referencableColumns: [
          'id',
          'city'
        ],
        sortLabelsColumns: {
          name: [
            'refColumn'
          ]
        },
        dimensions: [
          'dim1',
          'dim2',
          'dim3'
        ]
      }
    );
  });
});
