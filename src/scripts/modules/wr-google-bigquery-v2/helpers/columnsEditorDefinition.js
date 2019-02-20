import {List, Map} from 'immutable';
import Immutable from 'immutable';
import PreferencesColumn from '../react/components/PreferencesColumn';
import makeColumnDefinition from './makeColumnDefinition';

export default {
  initColumnFn: columnName => Map(makeColumnDefinition({name: columnName}).initColumn()),
  matchColumnKey: 'name',
  isColumnIgnored: column => column.get('type') === 'IGNORE',
  onSaveColumns: (tableId, columnsList) => {
    const configuration = {
      parameters: {
        tables: [
          {
            items: columnsList.toJS()
          }
        ]
      }
    };
    return Immutable.fromJS(configuration);
  },
  onLoadColumns: (configuration) => {
    return configuration.getIn(['parameters', 'tables', 0, 'items'], List());
  },
  prepareColumnContext: function(sectionContext) {
    return sectionContext;
  },
  columnsMappings: [
    {
      title: 'Preferences',
      render: PreferencesColumn
    }
  ],
  isComplete: () => true
};
