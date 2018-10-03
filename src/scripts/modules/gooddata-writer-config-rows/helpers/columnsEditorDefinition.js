import {Map, fromJS} from 'immutable';
import {parseParameters, createConfigParameters} from './rowTableParameters';
import PreferencesHeader from '../react/components/PreferencesHeader';
import PreferencesColumn from '../react/components/PreferencesColumn';
import makeColumnDefinition from './makeColumnDefinition';
import prepareColumnContext from './prepareColumnContext';
import getInitialShowAdvanced from './getInitialShowAdvanced';

export default {
  isColumnValidFn: (column) => !makeColumnDefinition(column).getInvalidReason(),
  initColumnFn: columnName => Map(makeColumnDefinition({id: columnName}).initColumn()),
  matchColumnKey: 'id',
  isColumnIgnored: column => column.get('type') === 'IGNORE',
  onSaveColumns: (tableId, columnsList) => {
    const columnsObject = columnsList.reduce((memo, column) =>
      memo.set(column.get('id'), column.delete('id')), Map());
    return createConfigParameters(fromJS({tableId, columns: columnsObject}));
  },
  onLoadColumns: (configuration) => {
    const configColumns = parseParameters(configuration).get('columns', Map());
    return configColumns
      .map((column, id) => column.set('id', id))
      .valueSeq().toList();
  },
  prepareColumnContext: prepareColumnContext,
  getInitialShowAdvanced: getInitialShowAdvanced,
  columnsMappings: [
    {
      title: PreferencesHeader,
      render: PreferencesColumn

    }
  ],
  isComplete: () => true
};
