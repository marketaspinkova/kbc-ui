import StoreUtils, { initStore } from '../../utils/StoreUtils';
import Immutable from 'immutable';
import dispatcher from '../../Dispatcher';
import * as constants from './constants';
import fuzzy from 'fuzzy';
import _ from 'underscore';

const { ColumnTypes, DataTypes } = constants;
const { fromJS, Map, List } = Immutable;

const NonTitleTypes = [ColumnTypes.IGNORE, ColumnTypes.DATE, ColumnTypes.REFERENCE];

let _store = initStore('GooddataWriterStore', Map({
  writers: Map(),
  tables: Map(),
  tableColumns: Map(),
  filters: Map(), // by [writer_id][tables] = value
  referenceableTables: Map(),
  pending: Map()
}));

const extendTable = function(table) {
  const tableId = table.get('id') || table.get('tableId');
  if (_.isEmpty(table.get('title'))) {
    return table.set('title', tableId);
  }
  return table;
};

const modifyColumns = function(cols, newColumn, currentColumn) {
  let columns = cols;
  // reference changed
  if (newColumn.get('reference') !== currentColumn.get('reference')) {
    columns = columns.map(function(column) {
      if (column.get('sortLabel') === currentColumn.get('name')) {
        return column.delete('sortOrder').delete('sortLabel');
      }
      return column;
    });
  }

  // schema reference changed
  if (newColumn.get('schemaReference') !== currentColumn.get('schemaReference')) {
    columns = columns.map(function(column) {
      if (column.get('name') === newColumn.get('name')) {
        return column;
      }
      if (column.get('schemaReference') === newColumn.get('schemaReference')) {
        return column.delete('schemaReference');
      }
      return column;
    });
  }

  // data type changed
  if (newColumn.get('dataType') !== currentColumn.get('dataType')) {
    columns = columns.update(newColumn.get('name'), function(column) {
      switch (column.get('dataType')) {
        case DataTypes.VARCHAR:
          return column.set('dataTypeSize', '255');
        case DataTypes.DECIMAL:
          return column.set('dataTypeSize', '12,2');
        default:
          return column.set('dataTypeSize', null);
      }
    });
  }

  // column type changed
  if (newColumn.get('type') !== currentColumn.get('type')) {
    let title = currentColumn.get('title');
    if (!NonTitleTypes.includes(newColumn.get('type')) && !title) {
      title = newColumn.get('name');
    }

    columns = columns.map(function(col) {
      let column = col;
      if (column.get('name') === newColumn.get('name')) {
        const columnDefaults = {
          title,
          dataType: null,
          dataTypeSize: null,
          reference: null,
          schemaReference: null,
          format: null,
          dateDimension: null,
          sortLabel: null,
          sortOrder: null
        };
        column = column.merge(Map(columnDefaults)).set('type', newColumn.get('type'));

        if (column.get('type') === ColumnTypes.DATE) {
          column = column.set('format', 'yyyy-MM-dd HH:mm:ss');
        }

        return column;
      }

      // reset references if column becomes non-referenceable
      const isNotReferencable =
        [ColumnTypes.CONNECTION_POINT, ColumnTypes.ATTRIBUTE].indexOf(newColumn.get('type')) < 0;
      if (column.get('reference') === newColumn.get('name') && isNotReferencable) {
        return column.delete('reference');
      }

      // allow only one connection point for table
      if (
        newColumn.get('type') === ColumnTypes.CONNECTION_POINT &&
        column.get('type') === ColumnTypes.CONNECTION_POINT
      ) {
        column = column.set('type', ColumnTypes.ATTRIBUTE);
      }

      return column;
    });
  }

  return columns;
};

/*

 */
const getInvalidColumns = (columns) =>
  columns
    .filter(function(column) {
      // empty name
      const isIgnored = column.get('type') === ColumnTypes.IGNORE;
      if (isIgnored) {
        return false;
      }

      const title = column.get('title');
      if (
        (!title || title.trim() === '') &&
        !NonTitleTypes.includes(column.get('type'))
      ) {
        return true;
      }

      // reference not set
      if ([ColumnTypes.LABEL, ColumnTypes.HYPERLINK].indexOf(column.get('type')) >= 0) {
        if (!column.get('reference')) {
          return true;
        }
      }

      // schema reference not set
      if (column.get('type') === ColumnTypes.REFERENCE && !column.get('schemaReference')) {
        return true;
      }
      // identifier must contain only lowercase and uppercase letters,
      // numbers, underscore "_" and dot "."
      const identifier = column.get('identifier');
      const identifierPattern = new RegExp('^([a-zA-Z0-9_.]+)$', 'g');
      if (!_.isEmpty(identifier)) {
        if (!identifier.match(identifierPattern)) {
          return true;
        }
      }

      // format and dateDimension not set for DATE type
      if (
        column.get('type') === ColumnTypes.DATE &&
        !(column.get('format') && column.get('dateDimension'))
      ) {
        return true;
      }

      return false;
    })
    .map((column) => column.get('name'));
const referenceableColumnFilter = (currentColumnName) =>
  (function(column) {
    if (column.get('name') === currentColumnName) {
      return false;
    }
    if ([ColumnTypes.CONNECTION_POINT, ColumnTypes.ATTRIBUTE].indexOf(column.get('type')) >= 0) {
      return true;
    }
    return false;
  });
const sortLabelColumnFilter = (currentColumnName) => (column) =>
  currentColumnName === column.get('reference');
const referencesForColumns = (columns) =>
  columns.map(function(column) {
    const refColumns = columns
      .filter(referenceableColumnFilter(column.get('name')))
      .map((col) => col.get('name'));
    const sortColumns = columns
      .filter(sortLabelColumnFilter(column.get('name')))
      .map((col) => col.get('name'));
    return Map({
      referenceableColumns: refColumns,
      sortColumns
    });
  });

const GoodDataWriterStore = StoreUtils.createStore({
  getDeletingTables(configurationId) {
    return _store.getIn(['pending', 'deletingTables', configurationId], Map());
  },

  isAddingNewTable(configurationId) {
    return _store.hasIn(['pending', 'adding', configurationId]);
  },

  hasWriter(configurationId) {
    return _store.hasIn(['writers', configurationId, 'config']);
  },

  hasTableColumns(configurationId, tableId) {
    return _store.hasIn(['tableColumns', configurationId, tableId, 'current']);
  },

  getWriter(configurationId) {
    return _store.getIn(['writers', configurationId]);
  },

  getWriterTablesFilter(configurationId) {
    return _store.getIn(['filters', configurationId, 'tables'], '');
  },

  getReferenceableTablesForTable(configurationId, tableId) {
    return _store
      .getIn(['referenceableTables', configurationId])
      .filter((name, id) => id !== tableId);
  },

  hasReferenceableTables(configurationId) {
    return _store.hasIn(['referenceableTables', configurationId]);
  },

  getWriterTablesByBucket(configurationId) {
    return _store.getIn(['tables', configurationId], Map()).toSeq();
  },

  getWriterTablesByBucketFiltered(configurationId) {
    const filter = this.getWriterTablesFilter(configurationId);

    const all = this.getWriterTablesByBucket(configurationId);
    if (!filter) {
      return all;
    }

    return all
      .map((tables) => tables.filter((table) => fuzzy.match(filter, table.getIn(['data', 'name']))))
      .filter((tables) => tables.count() > 0);
  },

  getTable(configurationId, tableId) {
    return _store.getIn(['tables', configurationId, tableId]);
  },

  getTableColumns(configurationId, tableId, version = 'current') {
    return _store.getIn(['tableColumns', configurationId, tableId, version]);
  },

  getTableColumnsValidation(configurationId, tableId) {
    return _store.getIn(['tableColumns', configurationId, tableId, 'invalidColumns'], List());
  },

  getTableColumnsReferences(configurationId, tableId) {
    return _store.getIn(
      ['tableColumns', configurationId, tableId, 'references'],
      Map({
        referenceableColumns: Map(),
        sortColumns: Map()
      })
    );
  },

  isEditingTableColumns(configurationId, tableId) {
    return _store.hasIn(['tableColumns', configurationId, tableId, 'editing']);
  },

  isSavingTableColumns(configurationId, tableId) {
    return _store.hasIn(['tableColumns', configurationId, tableId, 'isSaving']);
  }
});

dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_START:
      var configId = action.configurationId;
      var { tableId } = action;
      _store = _store.setIn(['pending', 'deletingTables', configId, tableId], true);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_SUCCESS:
      configId = action.configurationId;
      ({ tableId } = action);
      _store = _store.deleteIn(['pending', 'deletingTables', configId, tableId]);
      _store = _store.deleteIn(['tables', configId, tableId]);
      _store = _store.deleteIn(['tableColumns', configId, tableId]);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_ERROR:
      configId = action.configurationId;
      ({ tableId } = action);
      _store = _store.deleteIn(['pending', 'deletingTables', configId, tableId]);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_START:
      configId = action.configurationId;
      ({ tableId } = action);
      _store = _store.setIn(['pending', 'adding', configId], true);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_SUCCESS:
      configId = action.configurationId;
      ({ tableId } = action);
      var data = action.data || {};
      _store = _store.deleteIn(['pending', 'adding', configId]);
      var tables = _store.getIn(['tables', configId]);
      data.id = tableId;
      var newTable = fromJS({
        isLoading: false,
        id: tableId,
        editingFields: Map(),
        savingFields: List(),
        pendingActions: List(),
        data: fromJS(data)
      });
      tables = tables.set(tableId, newTable);
      _store = _store.setIn(['tables', configId], tables);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_ERROR:
      ({ tableId } = action);
      _store = _store.deleteIn(['pending', 'adding', configId]);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLES_FILTER_CHANGE:
      _store = _store.setIn(['filters', action.configurationId, 'tables'], action.filter);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_START:
      _store = _store.setIn(['writers', action.configurationId, 'isLoading'], true);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_ERROR:
      _store = _store.setIn(['writers', action.configurationId, 'isLoading'], false);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_SUCCESS:
      var tablesById = Immutable.fromJS(action.configuration.tables)
        .toOrderedMap()
        .map(function(table) {
          tableId = table.get('id') || table.get('tableId');
          return Map({
            isLoading: false,
            id: tableId,
            editingFields: Map(),
            savingFields: List(),
            pendingActions: List(),
            data: extendTable(table)
          });
        })
        .mapKeys((key, table) => table.get('id'));

      // open bucket it there is only one
      var bucketToggles = Map();
      _store = _store.withMutations((store) =>
        store
          .setIn(['writers', action.configuration.id, 'isLoading'], false)
          .setIn(['writers', action.configuration.id, 'isDeleting'], false)
          .setIn(['writers', action.configuration.id, 'isOptimizingSLI'], false)
          .setIn(['writers', action.configuration.id, 'bucketToggles'], bucketToggles)
          .setIn(
            ['writers', action.configuration.id, 'config'],
            Immutable.fromJS(action.configuration.writer)
          )
          .setIn(['tables', action.configuration.id], tablesById)
      );

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_START:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'savingFields'],
        (fields) => fields.push(action.field)
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_SUCCESS:
      _store = _store.withMutations((store) =>
        store
          .setIn(
            ['tables', action.configurationId, action.tableId, 'data', action.field],
            action.value
          )
          .deleteIn([
            'tables',
            action.configurationId,
            action.tableId,
            'editingFields',
            action.field
          ])
          .updateIn(['tables', action.configurationId, action.tableId, 'savingFields'], (fields) =>
            fields.delete(fields.indexOf(action.field))
          )
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_ERROR:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'savingFields'],
        (fields) => fields.delete(fields.indexOf(action.field))
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_SUCCESS:
      var columns = Immutable.OrderedMap(action.table.columns)
        .map((value) => Map(value))
        .map(function(column) {
          if (!column.get('title')) {
            return column.set('title', column.get('gdName'));
          }
          return column;
        });

      var table = Immutable.fromJS(action.table);
      _store = _store.withMutations((store) =>
        store
          .setIn(
            ['tables', action.configurationId, table.get('tableId'), 'data'],
            extendTable(table.remove('columns'))
          )
          .setIn(['tableColumns', action.configurationId, table.get('tableId'), 'current'], columns)
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_SUCCESS:
      _store = _store.setIn(
        ['referenceableTables', action.configurationId],
        Immutable.fromJS(action.tables)
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_START:
      _store = _store.withMutations(function(store) {
        columns = store.getIn(['tableColumns', action.configurationId, action.tableId, 'current']);
        columns = columns.map(function(c) {
          if (!c.get('title') && c.get('type') !== ColumnTypes.IGNORE) {
            return c.set('title', c.get('name'));
          } else {
            return c;
          }
        });
        return store
          .setIn(['tableColumns', action.configurationId, action.tableId, 'editing'], columns)
          .setIn(
            ['tableColumns', action.configurationId, action.tableId, 'references'],
            referencesForColumns(columns)
          );
      });
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_CANCEL:
      _store = _store.withMutations((store) =>
        store
          .deleteIn(['tableColumns', action.configurationId, action.tableId, 'editing'])
          .deleteIn(['tableColumns', action.configurationId, action.tableId, 'invalidColumns'])
      );

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_UPDATE:
      var currentColumn = _store.getIn([
        'tableColumns',
        action.configurationId,
        action.tableId,
        'editing',
        action.column.get('name')
      ]);

      _store = _store.updateIn(['tableColumns', action.configurationId, action.tableId], function(
        tableColumns
      ) {
        columns = tableColumns.get('editing');
        columns = columns.set(action.column.get('name'), action.column);
        columns = modifyColumns(columns, action.column, currentColumn);

        return tableColumns
          .set('editing', columns)
          .set('invalidColumns', getInvalidColumns(columns))
          .set('references', referencesForColumns(columns));
      });

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_START:
      _store = _store.setIn(
        ['tableColumns', action.configurationId, action.tableId, 'isSaving'],
        true
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_ERROR:
      _store = _store.deleteIn([
        'tableColumns',
        action.configurationId,
        action.tableId,
        'isSaving'
      ]);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_SUCCESS:
      _store = _store.withMutations((store) =>
        store
          .deleteIn(['tableColumns', action.configurationId, action.tableId, 'editing'])
          .deleteIn(['tableColumns', action.configurationId, action.tableId, 'isSaving'])
          .setIn(
            ['tableColumns', action.configurationId, action.tableId, 'current'],
            Immutable.OrderedMap(action.columns).map((value) => Map(value))
          )
      );

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_START:
      _store = _store.setIn(
        ['tables', action.configurationId, action.tableId, 'editingFields', action.field],
        GoodDataWriterStore.getTable(action.configurationId, action.tableId).getIn([
          'data',
          action.field
        ])
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_UPDATE:
      _store = _store.setIn(
        ['tables', action.configurationId, action.tableId, 'editingFields', action.field],
        action.value
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_CANCEL:
      _store = _store.deleteIn([
        'tables',
        action.configurationId,
        action.tableId,
        'editingFields',
        action.field
      ]);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_START:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'pendingActions'],
        (actions) => actions.push('resetTable')
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_SUCCESS:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'pendingActions'],
        (actions) => actions.delete(actions.indexOf('resetTable'))
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_START:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'pendingActions'],
        (actions) => actions.push('syncTable')
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_SUCCESS:
      _store = _store.updateIn(
        ['tables', action.configurationId, action.tableId, 'pendingActions'],
        (actions) => actions.delete(actions.indexOf('syncTable'))
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_START:
      if (action.tableId) {
        _store = _store.updateIn(
          ['tables', action.configurationId, action.tableId, 'pendingActions'],
          (actions) => actions.push('uploadTable')
        );
      } else {
        _store = _store.updateIn(
          ['writers', action.configurationId, 'pendingActions'],
          List(),
          (actions) => actions.push('uploadProject')
        );
      }
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_ERROR:
    case constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_SUCCESS:
      if (action.tableId) {
        _store = _store.updateIn(
          ['tables', action.configurationId, action.tableId, 'pendingActions'],
          (actions) => actions.delete(actions.indexOf('uploadTable'))
        );
      } else {
        _store = _store.updateIn(
          ['writers', action.configurationId, 'pendingActions'],
          List(),
          (actions) => actions.delete(actions.indexOf('uploadTable'))
        );
      }

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DELETE_START:
      _store = _store.setIn(['writers', action.configurationId, 'isDeleting'], true);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DELETE_ERROR:
      _store = _store.deleteIn(['writers', action.configurationId, 'isDeleting']);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DELETE_SUCCESS:
      _store = _store.deleteIn(['writers', action.configurationId, 'isDeleting']);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SLI_START:
      _store = _store.setIn(['writers', action.configurationId, 'isOptimizingSLI'], true);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SLI_SUCCESS:
    case constants.ActionTypes.GOOD_DATA_WRITER_SLI_ERROR:
      _store = _store.deleteIn(['writers', action.configurationId, 'isOptimizingSLI']);
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_SET_BUCKET_TOGGLE:
      var current = _store.getIn(
        ['writers', action.configurationId, 'bucketToggles', action.bucketId],
        false
      );

      _store = _store.setIn(
        ['writers', action.configurationId, 'bucketToggles', action.bucketId],
        !current
      );

      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_LOADING:
      _store = _store.updateIn(
        ['writers', action.configurationId, 'pendingActions'],
        List(),
        (actions) => actions.push('projectAccess')
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ENABLE:
      _store = _store.updateIn(
        ['writers', action.configurationId, 'pendingActions'],
        List(),
        (actions) => actions.delete(actions.indexOf('projectAccess'))
      );
      _store = _store.setIn(
        ['writers', action.configurationId, 'config', 'project', 'ssoAccess'],
        true
      );
      _store = _store.setIn(
        ['writers', action.configurationId, 'config', 'project', 'ssoLink'],
        action.ssoLink
      );
      _store = _store.setIn(
        ['writers', action.configurationId, 'config', 'project', 'encryptedClaims'],
        action.encryptedClaims
      );
      _store = _store.setIn(
        ['writers', action.configurationId, 'config', 'project', 'ssoProvider'],
        action.ssoProvider
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_DISABLE:
      _store = _store.updateIn(
        ['writers', action.configurationId, 'pendingActions'],
        List(),
        (actions) => actions.delete(actions.indexOf('projectAccess'))
      );
      _store = _store.setIn(
        ['writers', action.configurationId, 'config', 'project', 'ssoAccess'],
        false
      );
      return GoodDataWriterStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ERROR:
      _store = _store.updateIn(
        ['writers', action.configurationId, 'pendingActions'],
        List(),
        (actions) => actions.delete(actions.indexOf('projectAccess'))
      );
      return GoodDataWriterStore.emitChange();
    default:
      break;
  }
});

export default GoodDataWriterStore;
