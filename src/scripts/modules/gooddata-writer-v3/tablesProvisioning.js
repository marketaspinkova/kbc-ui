import configProvisioning from './configProvisioning';
import {Map} from 'immutable';

export default function(configId) {
  const {parameters, inputMapping, saveInputMappingAndParameters} = configProvisioning(configId);
  const tables = parameters.get('tables', Map());

  function createNewTable(tableId) {
    const newTable = Map({
      title: tableId
    });
    const newTableMapping = Map({source: tableId});
    const newParameters = parameters.setIn(['tables', tableId], newTable);
    const newMapping = inputMapping.push(newTableMapping);
    return saveInputMappingAndParameters(newMapping, newParameters, `Add table ${tableId}`);
  }

  return {
    createNewTable,
    tables
  };
}
