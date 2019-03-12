import storeProvisioning from './storeProvisioning';
import _ from 'underscore';
import {fromJS, List, Map} from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';
import generateId from '../../utils/generateId';
import SyncActionError from '../../utils/errors/SyncActionError';

export default function(COMPONENT_ID, configId) {
  const store = storeProvisioning(COMPONENT_ID, configId);

  // returns localState for @path and function to update local state
  // on @path+@subPath
  function prepareLocalState(path) {
    const ls = store.getLocalState(path);
    const updateLocalSubstateFn = (subPath, newData)  =>  {
      if (_.isEmpty(subPath)) {
        return updateLocalState([].concat(path), newData);
      } else {
        return updateLocalState([].concat(path).concat(subPath), newData);
      }
    };
    return {
      localState: ls,
      updateLocalState: updateLocalSubstateFn,
      prepareLocalState: (newSubPath) => prepareLocalState([].concat(path).concat(newSubPath))
    };
  }

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription)
      .then(() => updateLocalState(waitingPath, false));
  }

  function getConfigData() {
    return InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  }

  function touchSheet() {
    const existingIds = store.tables.map((q) => q.get('id'));

    return fromJS({
      'id': generateId(existingIds),
      'action': 'update',
      'sheetTitle': 'Sheet1',
      'enabled': true
    });
  }

  function isTableExportEnabled(tableId, tables) {
    const found = tables.find(t => t.get('tableId') === tableId);
    return found && found.get('enabled');
  }

  function tableExist(tableId, tables) {
    return !!tables.find(t => t.get('tableId') === tableId);
  }

  function saveTables(tables, mappings, savingPath, description) {
    const desc = description || 'Update tables';
    const limitedMappings = mappings
      .filter(mapping => tableExist(mapping.get('source'), tables))
      .map(t => isTableExportEnabled(t.get('source'), tables) ? t.delete('limit') : t.set('limit', 1));
    const data = store.configData
      .setIn(['parameters', 'tables'], tables)
      .setIn(['storage', 'input', 'tables'], limitedMappings)
    ;
    return saveConfigData(data, savingPath, desc);
  }

  function saveTable(table, mapping) {
    updateLocalState(store.getSavingPath(table.get('id')), true);

    if (!table.get('fileId')) {
      // create spreadsheet if not exist
      updateLocalState(['SheetModal', 'savingMessage'], 'Creating Spreadsheet');
      return createSpreadsheet(table)
        .then((data) => {
          if (data.status === 'error') {
            throw new SyncActionError(data.message || 'There was an error while creating spreadsheet');
          }
          return updateTable(
            table
              .set('fileId', data.spreadsheet.spreadsheetId)
              .set('sheetId', data.spreadsheet.sheets[0].properties.sheetId),
            mapping
          );
        })
        .finally(() => {
          updateLocalState(store.getSavingPath(table.get('id')), false);
        });
    } else if (!table.get('sheetId')) {
      // add new sheet, when importing to existing spreadsheet
      updateLocalState(['SheetModal', 'savingMessage'], 'Updating Spreadsheet');
      return addSheet(table)
        .then((data) => {
          if (data.status === 'error') {
            throw new SyncActionError(data.message || 'There was an error while updating spreadsheet');
          }
          return updateTable(
            table.set('sheetId', data.sheet.sheetId),
            mapping
          );
        })
        .finally(() => {
          updateLocalState(store.getSavingPath(table.get('id')), false);
        });
    }

    return updateTable(table, mapping);
  }

  function updateTable(table, mapping) {
    const tid = table.get('id');
    let found = false;
    let newTables = store.tables.map((t) => {
      if (t.get('id') === tid) {
        found = true;
        return table;
      }
      return t;
    });
    if (!found) {
      newTables = newTables.push(table);
    }

    let foundMapping = false;
    const filterMappings = store.mappings.filter((t) => typeof t === 'object');
    let newMappings = filterMappings.map((t) => {
      if (mapping && typeof t === 'object' && t.get('source') === mapping.get('source')) {
        foundMapping = true;
        return mapping;
      }
      return t;
    });
    if (!foundMapping && mapping) {
      newMappings = newMappings.push(mapping);
    }

    return saveTables(newTables, newMappings, store.getSavingPath(tid), `Update table ${tid}`);
  }

  function deleteTable(table) {
    const newTables = store.tables.filter((t) => t.get('id') !== table.get('id'));
    const newMappings = store.mappings.filter((t) => t.get('source') !== table.get('tableId'));
    const pendingPath = store.getPendingPath(['delete', table.get('id')]);
    const savingPath = store.getSavingPath(table.get('id'));

    updateLocalState(pendingPath, true);
    return saveTables(newTables, newMappings, savingPath, `Update table ${table.get('tableId')}`).then(() => {
      updateLocalState(pendingPath, false);
    });
  }

  function toggleEnabled(table) {
    const pendingPath = store.getPendingPath(table.get('id'));
    updateLocalState(pendingPath, true);
    return updateTable(table.set('enabled', !table.get('enabled')))
      .then(() => updateLocalState(pendingPath, false));
  }

  function createSpreadsheet(table) {
    const configData = getConfigData();
    let runData = configData
      .setIn(['parameters', 'tables'], List().push(table))
      .delete('storage');

    const params = {
      configData: runData.toJS()
    };
    return callDockerAction(COMPONENT_ID, 'createSpreadsheet', params);
  }

  function addSheet(table) {
    const configData = getConfigData();
    let runData = configData
      .setIn(['parameters', 'tables'], List().push(table))
      .delete('storage');

    const params = {
      configData: runData.toJS()
    };
    return callDockerAction(COMPONENT_ID, 'addSheet', params);
  }

  return {
    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,
    generateId: generateId,
    touchSheet: touchSheet,
    saveTables: saveTables,
    saveTable: saveTable,
    deleteTable: deleteTable,
    toggleEnabled: toggleEnabled
  };
}
