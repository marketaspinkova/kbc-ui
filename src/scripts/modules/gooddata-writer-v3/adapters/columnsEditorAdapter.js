import makeColumnDefinition from '../helpers/makeColumnDefinition';
import { Map, fromJS, List } from 'immutable';
import getInitialShowAdvanced from '../helpers/getInitialShowAdvanced';
import PreferencesHeader from '../react/components/PreferencesHeader';
import PreferencesColumn from '../react/components/PreferencesColumn';
import prepareColumnContext from '../helpers/prepareColumnContext';

function initColumnFn(columnName) {
  return Map(makeColumnDefinition({ id: columnName }).initColumn());
}

function isColumnValid(column) {
  return !makeColumnDefinition(column).getInvalidReason();
}

function isColumnIgnored(column) {
  return column.get('type') === 'IGNORE';
}

function prepareAllTableColumns(configuredColumns, storageTableColumns) {
  const configuredColumnsList = configuredColumns
    .map((column, id) => column.set('id', id))
    .valueSeq()
    .toList();
  const deletedColumns = configuredColumnsList
    .map(configColumn => configColumn.get('id'))
    .filter(configColumnName => !storageTableColumns.find(tableColumn => tableColumn === configColumnName));
  const allTableColumns = storageTableColumns.concat(deletedColumns);

  const allColumnsList = allTableColumns.map(
    tableColumn =>
      configuredColumnsList.find(configColumn => configColumn.get('id') === tableColumn, null) ||
      initColumnFn(tableColumn)
  );
  return allColumnsList;
}

export default function(configProvisioning, tablesProvisioning, storageTable, tableId) {
  const { isSaving, parameters } = configProvisioning;
  const { getEditingTable, setEditingTable, tables } = tablesProvisioning;
  const editing = getEditingTable(tableId);
  const tableExist = !!storageTable;
  const storageTableColumns = tableExist ? storageTable.get('columns', List()) : List();
  const configuredColumns = editing.tableParameters.get('columns', Map());
  const allColumnsList = prepareAllTableColumns(configuredColumns, storageTableColumns);

  function onChangeColumns(newValue) {
    const columnsToSave = fromJS(newValue.columns).filter(column => !isColumnIgnored(column));
    const paramsColumns = columnsToSave.reduce(
      (memo, column) => memo.set(column.get('id'), column.delete('id')),
      Map()
    );
    const mappingColumns = columnsToSave.map(column => column.get('id'));
    const newTableParams = editing.tableParameters.set('columns', paramsColumns);
    const newTableMapping = editing.tableInputMapping.set('columns', mappingColumns);
    setEditingTable(tableId, newTableParams, newTableMapping);
  }

  const context = prepareColumnContext(parameters, tables, tableId, allColumnsList);

  const value = Map({
    tableExist,
    columns: allColumnsList,
    tableId,
    columnsMappings: [
      {
        title: PreferencesHeader,
        render: PreferencesColumn
      }
    ],
    context,
    matchColumnKey: 'id',
    isColumnValidFn: isColumnValid,
    getInitialShowAdvanced
  });

  return {
    value: value.toJS(),
    onChange: onChangeColumns,
    disabled: isSaving
  };
}
