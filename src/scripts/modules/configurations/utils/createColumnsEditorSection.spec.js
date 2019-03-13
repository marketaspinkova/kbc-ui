import PropTypes from 'prop-types';
import React from 'react';
import createColumnsEditorSection from './createColumnsEditorSection';
import { fromJS } from 'immutable';

const ColumnMapping = ({ column, disabled, onChange, showAdvanced, context }) => (
  <span disabled={disabled}>
    <div>{column.columnId}</div>
    <div>{column.type}</div>
    <div>{context.tableId}</div>
    <div>{context.columnsCount}</div>
    <span onClick={() => onChange({ ...column, type: 'ignore' })}> ignore column</span>
    {showAdvanced && <span> show advanced</span>}
  </span>
);

ColumnMapping.propTypes = {
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  column: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  showAdvanced: PropTypes.bool
};

const configuration = fromJS({
  parameters: {
    storage: {
      input: {
        tables: [
          {
            source: 'in.some.table',
            columns: ['age', 'person', 'deletedColumn']
          }
        ]
      }
    },
    tableId: 'in.some.table',
    columns: [
      {
        columnId: 'age',
        type: 'number'
      },
      {
        columnId: 'person',
        type: 'varchar'
      },
      {
        columnId: 'deletedColumn',
        type: 'varchar'
      }
    ]
  }
});

const sectionContext = fromJS({
  tableId: 'in.some.table',
  table: {
    id: 'in.some.table',
    columns: ['age', 'person', 'otherColumn']
  }
});

const editorSectionDefinition = {
  matchColumnKey: 'columnId',
  onLoadColumns: config => config.getIn(['parameters', 'columns']),
  onSaveColumns: (tableId, columnsList) =>
    fromJS({
      parameters: {
        tableId: tableId,
        columns: columnsList
      }
    }),
  isColumnIgnored: column => column.get('type') === 'ignore',
  initColumnFn: columnName => fromJS({ columnId: columnName, type: 'ignore' }),
  isColumnValidFn: column => ['varchar', 'number'].includes(column.type),
  prepareColumnContext: (context, allColumns) =>
    fromJS({
      tableId: context.getIn(['table', 'id']),
      columnsCount: allColumns.count()
    }),
  getInitialShowAdvanced: () => false,
  columnsMappings: [
    {
      title: 'Column Setup',
      render: ColumnMapping
    }
  ]
};

describe('columns editor section', () => {
  it('test onLoad and onSave section functions', () => {
    const editorSection = createColumnsEditorSection(editorSectionDefinition).toJS();
    const localState = editorSection.onLoad(configuration, sectionContext);
    expect(localState.toJS()).toEqual({
      columns: [
        {
          columnId: 'age',
          type: 'number'
        },
        {
          columnId: 'person',
          type: 'varchar'
        },
        {
          columnId: 'otherColumn',
          type: 'ignore'
        },
        {
          columnId: 'deletedColumn',
          type: 'varchar'
        }
      ],
      tableExist: true,
      tableId: 'in.some.table',
      columnsMappings: editorSectionDefinition.columnsMappings,
      context: {
        tableId: 'in.some.table',
        columnsCount: 4
      },
      matchColumnKey: 'columnId',
      getInitialShowAdvanced: editorSectionDefinition.getInitialShowAdvanced,
      isColumnValidFn: editorSectionDefinition.isColumnValidFn
    });

    const configToSave = editorSection.onSave(localState);
    expect(configToSave.toJS()).toEqual({
      storage: {
        input: {
          tables: [
            {
              source: 'in.some.table',
              columns: ['age', 'person', 'deletedColumn']
            }
          ]
        }
      },
      parameters: {
        tableId: 'in.some.table',
        columns: [
          {
            columnId: 'age',
            type: 'number'
          },
          {
            columnId: 'person',
            type: 'varchar'
          },
          {
            columnId: 'deletedColumn',
            type: 'varchar'
          }
        ]
      }
    });
  });
  it('test nonexisting table render', () => {
    const editorSection = createColumnsEditorSection(editorSectionDefinition).toJS();
    const nonExistingTableContext = fromJS({
      table: null,
      tableId: 'in.some.table'
    });
    const localState = editorSection.onLoad(configuration, nonExistingTableContext).toJS();
    const EditorComponent = editorSection.render;
    renderSnapshot(<EditorComponent value={localState} onChange={() => null} disabled={false} />);
  });
  it('test render', () => {
    const editorSection = createColumnsEditorSection(editorSectionDefinition).toJS();
    const localState = editorSection.onLoad(configuration, sectionContext).toJS();
    const EditorComponent = editorSection.render;
    renderSnapshot(<EditorComponent value={localState} onChange={() => null} disabled={false} />);
  });
});
