import configProvisioning from './configProvisioning';
import {Map} from 'immutable';

export default function(configId) {
  const {parameters, inputMapping, saveInputMappingAndParameters} = configProvisioning(configId);
  const tables = parameters.get('tables', Map());

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
    toggleTableExport
  };
}
