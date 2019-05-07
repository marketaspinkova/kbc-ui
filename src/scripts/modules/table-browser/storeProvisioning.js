import tableBrowserStore from './flux/store';
import tablesStore from '../components/stores/StorageTablesStore';
import _ from 'underscore';
import {Map} from 'immutable';

export default function(tableId) {
  const getLocalState = (path) => {
    const ls = tableBrowserStore.getLocalState(tableId);
    if (path) {
      return ls.getIn([].concat(path));
    } else {
      return ls;
    }
  };
  const isLoading = tablesStore.getIsLoading();
  const tables = tablesStore.getAll() || Map();
  const table = tables.get(tableId, Map());
  const tableExists = () => !_.isEmpty(table.toJS());
  const eventService = getLocalState('eventService');
  return {
    getLocalState: getLocalState,
    eventService: eventService,
    table: table,
    isLoading: isLoading,
    isLoadingAll: () => isLoading || getLocalState('loadingPreview') || eventService.getIsLoading(),
    tableExists: tableExists
  };
}