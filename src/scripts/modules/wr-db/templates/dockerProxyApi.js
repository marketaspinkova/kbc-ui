const dockerComponents = ['wr-db-mssql'];
import {Map} from 'immutable';
import Promise from 'bluebird';

import InstalledComponentsActions from '../../components/InstalledComponentsActionCreators';
import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';

function isDockerBasedWriter(componentId) {
  return dockerComponents.includes(componentId);
}

export default function(componentId) {
  if (!isDockerBasedWriter(componentId)) {
    return null;
  }

  return {
    loadConfigData(configId) {
      return InstalledComponentsActions.loadComponentConfigData(componentId, configId).then(
        () => InstalledComponentsStore.getConfigData(componentId, configId) || Map());
    },

    getCredentials(configId) {
      return this.loadConfigData(configId).then(
        (data) => {
          console.log('DATAAA', data.toJS());
          return data.getIn(['parameters', 'db']);
        }
      );
    },

    getTables(configId) {
      return this.loadConfigData(configId).then(
        (data) => {
          const tables = data.getIn(['parameters', 'tables']);
          return tables.map((table) => table.set('id', table.get('tableId')));
        }
      );
    },

    getTable(configId, tableId) {
      return this.loadConfigData(configId).then(
        (data) => {
          const tables = data.getIn(['parameters', 'tables']);
          var table = tables.find( (t) => t.get('tableId') === tableId);
          if (!table) {
            return Promise.reject('Error: table ' + tableId + ' not exits in the config');
          }

          table = table.set('columns', table.get('items'));
          return table;
        }
      );
    }

  };
}
