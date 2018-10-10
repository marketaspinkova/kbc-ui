import configProvisioning from './configProvisioning';
import tablesProvisioning from './tablesProvisioning';
import {fromJS, Map} from 'immutable';

export default function(configId, tableId) {
  const {isSaving} = configProvisioning(configId);
  const {getEditingTable, updateEditingTable} = tablesProvisioning(configId);
  const editing = getEditingTable(tableId);

  const value = Map({
    title: editing.tableParameters.get('title'),
    identifier: editing.tableParameters.get('identifier')
  });

  function onChange(newValue) {
    updateEditingTable(tableId, fromJS(newValue), editing.tableInputMapping);
  }

  return {
    value: value.toJS(),
    onChange: onChange,
    disabled: isSaving
  };
}
