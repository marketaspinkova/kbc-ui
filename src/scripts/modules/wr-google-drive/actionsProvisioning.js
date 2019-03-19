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

  function saveConfigData(data, savingPath, changeDescription) {
    updateLocalState(savingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription)
      .then(() => updateLocalState(savingPath, false));
  }

  function getConfigData() {
    return InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  }

  function touchFile() {
    const existingIds = store.tables.map((q) => q.get('id'));

    return fromJS({
      'id': generateId(existingIds),
      'action': 'update',
      'enabled': true,
      'convert': false
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
      .setIn(['storage', 'input', 'tables'], limitedMappings);
    return saveConfigData(data, savingPath, desc);
  }

  function saveTable(table, mapping) {
    updateLocalState(store.getSavingPath(table.get('id')), true);
    // create file if not exists and action is not 'create'
    if (!table.get('fileId') && table.get('action') !== 'create') {
      updateLocalState(['FileModal', 'savingMessage'], 'Creating new File');
      return createFileAction(table)
        .then((data) => {
          if (data.status === 'error') {
            throw new SyncActionError(data.message || 'There was an error while creating the file');
          }
          return updateTable(
            table
              .set('fileId', data.file.id)
              .setIn(['folder', 'id'], data.file.folder.id)
              .setIn(['folder', 'title'], data.file.folder.title),
            mapping,
            'Create'
          );
        })
        .finally(() => {
          updateLocalState(store.getSavingPath(table.get('id')), false);
        });
    }
    updateLocalState(store.getSavingPath(table.get('id')), true);
    updateLocalState(['FileModal', 'savingMessage'], 'Saving');
    return getFolderAction(table)
      .then((data) => {
        if (data.status === 'error') {
          throw new SyncActionError(data.message || 'There was an error while updating the file');
        }
        return updateTable(
          table
            .setIn(['folder', 'id'], data.file.id)
            .setIn(['folder', 'title'], data.file.name),
          mapping
        );
      })
      .finally(() => {
        updateLocalState(store.getSavingPath(table.get('id')), false);
      });
  }

  function updateTable(table, mapping, actionDesc = 'Update') {
    const tid = table.get('id');
    const tableId = table.get('tableId');
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
    return saveTables(newTables, newMappings, store.getSavingPath(tid), `${actionDesc} table ${tableId}`);
  }

  function deleteTable(table) {
    const pendingPath = store.getDeletingPath(table.get('id'));
    updateLocalState(pendingPath, true);
    const newTables = store.tables.filter((t) => t.get('id') !== table.get('id'));
    const newMappings = store.mappings.filter((t) => t.get('source') !== table.get('tableId'));
    return saveTables(
      newTables,
      newMappings,
      store.getSavingPath(table.get('id')),
      `Delete table upload ${table.get('tableId')}`
    ).then(() => updateLocalState(pendingPath, false));
  }

  function toggleEnabled(table) {
    const pendingPath = store.getPendingPath(table.get('id'));
    updateLocalState(pendingPath, true);
    return updateTable(table.set('enabled', !table.get('enabled')))
      .then(() => updateLocalState(pendingPath, false));
  }

  function createFileAction(table) {
    const params = {
      configData: getConfigData()
        .setIn(['parameters', 'tables'], List().push(table))
        .delete('storage')
        .toJS()
    };
    return callDockerAction(COMPONENT_ID, 'createFile', params);
  }

  function getFolderAction(table) {
    const params = {
      configData: getConfigData()
        .setIn(['parameters', 'tables'], List().push(table))
        .delete('storage')
        .toJS()
    };
    return callDockerAction(COMPONENT_ID, 'getFolder', params);
  }

  return {
    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,
    generateId: generateId,
    touchFile: touchFile,
    saveTables: saveTables,
    saveTable: saveTable,
    deleteTable: deleteTable,
    toggleEnabled: toggleEnabled
  };
}
