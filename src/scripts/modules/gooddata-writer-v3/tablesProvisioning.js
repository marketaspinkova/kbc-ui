import configProvisioning from './configProvisioning';
import localStateProvisioning from './localStateProvisioning';
import { Map, List } from 'immutable';
const EDITING_PATH = ['editing'];

export default function(configId) {
  const { parameters, inputMapping, saveInputMappingAndParameters } = configProvisioning(configId);
  const { getLocalStateValue, updateLocalState } = localStateProvisioning(configId);
  const tables = parameters.get('tables', Map());
  const initialEditingTables = Map({
    parameters: Map(),
    inputMapping: List()
  });

  const editingTables = getLocalStateValue(EDITING_PATH, initialEditingTables);

  function getEditingTable(tableId) {
    const storedTableParameters = tables.get(tableId);
    const storedInputMapping = inputMapping.find(table => table.get('source') === tableId);
    const tableParameters = editingTables.getIn(['parameters', tableId]) || storedTableParameters;
    const tableInputMapping =
      editingTables.get('inputMapping').find(table => table.get('source') === tableId) || storedInputMapping;
    return {
      tableParameters,
      tableInputMapping
    };
  }

  function isEditingTableChanged(tableId) {
    const { tableParameters, tableInputMapping } = getEditingTable(tableId);
    const storedTableParameters = tables.get(tableId);
    const storedInputMapping = inputMapping.find(table => table.get('source') === tableId);
    return tableParameters !== storedTableParameters || tableInputMapping !== storedInputMapping;
  }

  function setEditingTable(tableId, tableParams, tableInputMapping) {
    const tableMappingIndex = editingTables.get('inputMapping').findIndex(tableIm => tableIm.get('source') === tableId);
    let newEditingTables = editingTables.setIn(['parameters', tableId], tableParams);
    if (tableMappingIndex > -1) {
      newEditingTables = newEditingTables.setIn(['inputMapping', tableMappingIndex], tableInputMapping);
    } else {
      newEditingTables = newEditingTables.update('inputMapping', editingInputMapping =>
        editingInputMapping.push(tableInputMapping)
      );
    }
    updateLocalState(EDITING_PATH, newEditingTables);
  }

  function updateEditingTable(tableId, tableParams, tableInputMapping) {
    const editingTable = getEditingTable(tableId);
    const newTableParams = editingTable.tableParameters.mergeDeep(tableParams);
    const newTableInputMapping = editingTable.tableInputMapping.mergeDeep(tableInputMapping);
    setEditingTable(tableId, newTableParams, newTableInputMapping);
  }

  function resetEditingTable(tableId) {
    setEditingTable(tableId, null, Map());
  }

  function saveEditingTable(tableId) {
    const editing = getEditingTable(tableId);
    const newParameters = parameters.setIn(['tables', tableId], editing.tableParameters);
    const tableMappingIndex = inputMapping.findIndex(table => table.get('source') === tableId);
    const newMapping = inputMapping.set(tableMappingIndex, editing.tableInputMapping);
    const changeDescription = `update ${tableId} table`;
    return saveInputMappingAndParameters(newMapping, newParameters, changeDescription).then(() =>
      resetEditingTable(tableId)
    );
  }

  function updateTableMapping(ptableId, updateFn) {
    return inputMapping.map((table, tableId) => (tableId === ptableId ? updateFn(table) : table));
  }

  function createNewTable(tableId, title) {
    const newTable = Map({
      columns: {},
      title
    });
    const newTableMapping = Map({ source: tableId, columns: [] });
    const newParameters = parameters.setIn(['tables', tableId], newTable);
    const newMapping = inputMapping.push(newTableMapping);
    return saveInputMappingAndParameters(newMapping, newParameters, `Add table ${tableId}`);
  }

  function toggleTableExport(tableId, isEnabled) {
    const newMapping = updateTableMapping(
      tableId,
      table => (isEnabled ? table.delete('limit') : table.set('limit', 1))
    );
    const newParameters = parameters.updateIn(['tables', tableId], table => table.set('disabled', !isEnabled));
    const changeDescription = `${isEnabled ? 'Enable' : 'Disabled'} ${tableId} export`;
    return saveInputMappingAndParameters(newMapping, newParameters, changeDescription, [tableId, 'activate']).then(
      () => {
        if (isEditingTableChanged(tableId)) {
          const mappingObjectToMerge = isEnabled ? { source: tableId } : { source: tableId, limit: 1 };
          updateEditingTable(tableId, Map({ disabled: !isEnabled }), Map(mappingObjectToMerge));
        }
      }
    );
  }

  function deleteTable(tableId) {
    const newMapping = inputMapping.filter(mapping => mapping.get('source') !== tableId);
    const newParameters = parameters.deleteIn(['tables', tableId]);
    return saveInputMappingAndParameters(newMapping, newParameters, `delete table ${tableId}`, [tableId, 'delete']);
  }

  function getSingleRunParams(tableId, loadDataOnly) {
    const newParameters = parameters
      .update('tables', paramsTables => Map({ [tableId]: paramsTables.get(tableId).set('disabled', false) }))
      .set('loadOnly', !!loadDataOnly);
    const tableInputMapping = inputMapping.find(table => table.get('source') === tableId);
    return {
      config: configId,
      configData: {
        parameters: newParameters.toJS(),
        storage: {
          input: {
            tables: [tableInputMapping.toJS()]
          }
        }
      }
    };
  }

  return {
    getSingleRunParams,
    createNewTable,
    deleteTable,
    tables,
    toggleTableExport,
    updateEditingTable,
    setEditingTable,
    getEditingTable,
    isEditingTableChanged,
    saveEditingTable,
    resetEditingTable
  };
}
