import {Types} from './Constants';
import {Map, List, fromJS} from 'immutable';

const REFERENCABLE_COLUMN_TYPES = [Types.CONNECTION_POINT, Types.ATTRIBUTE];

export default function prepareColumnContext(sectionContext, allColumns) {
  const configRows = sectionContext.get('rows', List());
  const tableId = sectionContext.getIn(['table', 'id']);
  const dimensionsPath = ['configuration', 'parameters', 'dimensions'];

  const referencableTables = configRows.reduce((result, configRow) => {
    const configRowTables =  configRow.getIn(['parameters', 'tables']);
    // ignore current table config row
    if (configRowTables.has(tableId)) {
      return result;
    }
    const rowColumns = configRowTables.first().get('columns', Map());
    const matchColumn = rowColumns.find(column => column.get('type') === Types.CONNECTION_POINT);
    const rowTableId = configRowTables.keySeq().first();
    if (matchColumn) {
      return result.push(rowTableId);
    }
    return result;
  }, List());
  const referencableColumns = allColumns
    .filter(column => REFERENCABLE_COLUMN_TYPES.includes(column.get('type')))
    .map(column => column.get('id'));
  const sortLabelsColumns = allColumns.reduce((memo, column) => {
    if (!column.get('reference')) return memo;
    return memo.update(column.get('reference'), List(), labels => labels.push(column.get('id')));
  }, Map());

  const dimensions = sectionContext.getIn(dimensionsPath, Map()).keySeq().toList();
  return fromJS({referencableTables, referencableColumns, sortLabelsColumns, dimensions});
}
