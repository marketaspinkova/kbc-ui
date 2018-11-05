import {Types} from '../constants';
import {Map, List, fromJS} from 'immutable';

const REFERENCABLE_COLUMN_TYPES = [Types.CONNECTION_POINT, Types.ATTRIBUTE];

export default function prepareColumnContext(configParameters, allTables, currentTableId, allTableColumns) {
  const referencableTables = allTables.reduce((result, table, tableId) => {
    // ignore current table config row
    if (tableId === currentTableId) {
      return result;
    }
    const tableColumns = table.get('columns', Map());
    const connectionPointColumn = tableColumns.find(column => column.get('type') === Types.CONNECTION_POINT);
    if (connectionPointColumn) {
      return result.push(tableId);
    }
    return result;
  }, List());
  const referencableColumns = allTableColumns
    .filter(column => REFERENCABLE_COLUMN_TYPES.includes(column.get('type')))
    .map(column => column.get('id'));
  const sortLabelsColumns = allTableColumns.reduce((memo, column) => {
    if (!column.get('reference')) return memo;
    return memo.update(column.get('reference'), List(), labels => labels.push(column.get('id')));
  }, Map());

  const dimensions = configParameters.get('dimensions', Map()).keySeq().toList();
  return fromJS({referencableTables, referencableColumns, sortLabelsColumns, dimensions});
}
