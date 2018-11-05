import {fromJS, Map} from 'immutable';

export default function(configProvisioning, tablesProvisioning, tableId) {
  const {isSaving} = configProvisioning;
  const {getEditingTable, updateEditingTable} = tablesProvisioning;
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
