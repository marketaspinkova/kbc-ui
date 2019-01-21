import prepareColumnContext from './prepareColumnContext';
import { fromJS, Map, List } from 'immutable';

const tableId = 'in.some.table';
const configuration = fromJS({
  parameters: {
    tables: {
      'in.some.table': {
        columns: {
          id: {
            type: 'CONNECTION_POINT',
            title: 'id'
          }
        }
      },
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
    },
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
    const columnContext = prepareColumnContext(Map(), Map(), tableId, List());
    expect(columnContext.toJS()).toEqual({
      referencableTables: [],
      referencableColumns: [],
      sortLabelsColumns: {},
      dimensions: []
    });
  });

  it('should pass with some context and columns', () => {
    const configParameters = configuration.get('parameters');
    const allTables = configuration.getIn(['parameters', 'tables']);
    const columnContext = prepareColumnContext(configParameters, allTables, tableId, allColumns);
    expect(columnContext.toJS()).toEqual({
      referencableTables: ['in.OTHER.TABLE'],
      referencableColumns: ['id', 'city'],
      sortLabelsColumns: {
        name: ['refColumn']
      },
      dimensions: ['dim1', 'dim2', 'dim3']
    });
  });
});
