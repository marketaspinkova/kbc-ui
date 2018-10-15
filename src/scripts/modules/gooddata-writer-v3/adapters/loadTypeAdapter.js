import configProvisioning from '../configProvisioning';
import tablesProvisioning from '../tablesProvisioning';
import {fromJS, Map, List} from 'immutable';
import {Types} from '../constants';

const GRAIN_TYPES = [
  Types.REFERENCE,
  Types.ATTRIBUTE,
  Types.DATE
];

export default function(configId, tableId) {
  const {isSaving} = configProvisioning(configId);
  const {getEditingTable, updateEditingTable} = tablesProvisioning(configId);
  const editing = getEditingTable(tableId);


  const columns = editing.tableParameters.get('columns', Map());
  const grainColumns = columns
    .filter(column => GRAIN_TYPES.includes(column.get('type')))
    .map((column, columnId) => columnId)
    .valueSeq().toList();
  const hasConnectionPoint = !!columns.find(column => column.get('type') === Types.CONNECTION_POINT);

  const value = fromJS({
    grainColumns,
    hasConnectionPoint,
    tableId: tableId,
    changedSince: editing.tableInputMapping.get('changed_since', ''),
    grain: editing.tableParameters.get('grain') || List()
  });

  function onChange(newValue) {
    let newParameters = editing.tableParameters;
    if (newValue.grain) {
      newParameters = fromJS({grain: newValue.grain});
    }
    let newMapping = editing.tableInputMapping;
    if (newValue.changedSince) {
      newMapping = fromJS({'changed_since': newValue.changedSince});
    }
    updateEditingTable(tableId, newParameters, newMapping);
  }

  return {
    value: value.toJS(),
    onChange: onChange,
    disabled: isSaving
  };
}
