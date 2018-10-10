import configProvisioning from './configProvisioning';
import localStateProvisioning from './localStateProvisioning';
import {Map} from 'immutable';
const EDITING_PATH = ['editing'];

export default function(configId) {
  const {parameters, inputMapping, saveInputMappingAndParameters} = configProvisioning(configId);
  const {getLocalStateValue, updateLocalState} = localStateProvisioning(configId);
  const tables = parameters.get('tables', Map());
  const initialEditingTables = Map({
    parameters: tables,
    inputMapping
  });

  const editingTables = getLocalStateValue(EDITING_PATH, initialEditingTables);


  function getEditingTable(tableId) {
    return {
      tableParameters: editingTables.getIn(['parameters', tableId]),
      tableInputMapping: editingTables.get('inputMapping').find(table => table.get('source') === tableId)
    };
  }

  function isEditingTableChanged(tableId) {
    const {tableParameters, tableInputMapping} = getEditingTable(tableId);
    const storedTableParameters = tables.get(tableId);
    const storedInputMapping = inputMapping.find(table => table.get('source') === tableId);
    return tableParameters !== storedTableParameters || tableInputMapping !== storedInputMapping;
  }


  function updateEditingTable(tableId, tableParams, tableInputMapping, strategy = 'merge') {
    const editing = getEditingTable(tableId);
    let newTableParams = null;
    let newInputMapping = null;
    switch (strategy) {
      case 'set':
        newTableParams = tableParams;
        newInputMapping = tableInputMapping;
        break;
      case 'merge':
        newTableParams = editing.tableParameters.mergeDeep(tableParams);
        newInputMapping = editing.tableInputMapping.mergeDeep(tableInputMapping);
        break;
      default:
        throw new Error({message: `Unkwnown strategy: ${strategy}`});
    }

    let newEditingTables = editingTables.setIn(['parameters', tableId], newTableParams);
    const tableMappingIndex = editingTables
      .get('inputMapping')
      .findIndex(tableIm => tableIm.get('source') === tableId);
    newEditingTables = newEditingTables.setIn(['inputMapping', tableMappingIndex],  newInputMapping);
    updateLocalState(EDITING_PATH, newEditingTables);
  }

  function resetEditingTable(tableId) {
    updateEditingTable(tableId, tables.get(tableId), inputMapping.find(table => table.get('source') === tableId), 'set');
  }

  function saveEditingTable(tableId) {
    const editing = getEditingTable(tableId);
    const newParameters = parameters.setIn(['tables', tableId], editing.tableParameters);
    const tableMappingIndex = inputMapping.findIndex(table => table.get('source') === tableId);
    const newMapping = inputMapping.set(tableMappingIndex, editing.tableInputMapping);
    const changeDescription = `update ${tableId} table`;
    return saveInputMappingAndParameters(newMapping, newParameters, changeDescription).then(() => resetEditingTable(tableId));
  }

  function updateTableMapping(ptableId, updateFn) {
    return inputMapping.map((table, tableId) => tableId === ptableId ? updateFn(table) : table);
  }

  function updateTableParameters(tableId, updateFn) {
    return parameters.setIn(['tables', tableId], updateFn(tables.get(tableId)));
  }

  function createNewTable(tableId) {
    const newTable = Map({
      title: tableId
    });
    const newTableMapping = Map({source: tableId});
    const newParameters = parameters.setIn(['tables', tableId], newTable);
    const newMapping = inputMapping.push(newTableMapping);
    return saveInputMappingAndParameters(newMapping, newParameters, `Add table ${tableId}`);
  }

  function toggleTableExport(tableId, isEnabled) {
    const newMapping = updateTableMapping(tableId, (table) => isEnabled ? table.delete('limit') : table.set('limit', 1));
    const newParameters = updateTableParameters(tableId, (table) => table.set('disabled', !isEnabled));
    return saveInputMappingAndParameters(newMapping, newParameters, `${isEnabled ? 'Enable' : 'Disabled'} ${tableId} export`, [tableId, 'activate']);
  }

  function deleteTable(tableId) {
    const newMapping = inputMapping.filter((table, mtableId) => mtableId !== tableId );
    const newParameters = parameters.deleteIn(['tables', tableId]);
    return saveInputMappingAndParameters(newMapping, newParameters, `delete table ${tableId}`, [tableId, 'delete']);
  }


  function getSingleRunParams(tableId) {
    return {
      config: configId,
      TODO: tableId
    };
  }

  return {
    getSingleRunParams,
    createNewTable,
    deleteTable,
    tables,
    toggleTableExport,
    updateEditingTable,
    getEditingTable,
    isEditingTableChanged,
    saveEditingTable,
    resetEditingTable
  };
}
