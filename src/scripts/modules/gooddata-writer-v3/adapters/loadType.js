import {Map, fromJS, List} from 'immutable';
import {parseParameters, createConfigParameters} from '../helpers/rowTableParameters';
import {createInputMapping, parseInputMapping} from '../helpers/inputMapping';
import {Types} from '../helpers/Constants';

const GRAIN_TYPES = [
  Types.REFERENCE,
  Types.ATTRIBUTE,
  Types.DATE
];


const createConfiguration = (localState) => {
  const changedSince = localState.get('changedSince', '');
  const storage =  createInputMapping(Map({changed_since: changedSince}));
  const grain = localState.get('grain') || List();
  const parameters = createConfigParameters(fromJS({
    grain: grain.count() > 0 && !localState.get('hasConnectionPoint') ? grain : null,
    tableId: localState.get('tableId')
  }));
  return storage.merge(parameters);
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration(configuration) {
    const parametersTable = parseParameters(configuration);
    const configColumns = parametersTable.get('columns', Map());
    const grainColumns = configColumns
      .filter(column => GRAIN_TYPES.includes(column.get('type')))
      .map((column, columnId) => columnId)
      .valueSeq().toList();
    const hasConnectionPoint = !!configColumns.find(column => column.get('type') === Types.CONNECTION_POINT);
    return fromJS({
      grainColumns,
      hasConnectionPoint,
      tableId: parametersTable.get('tableId'),
      changedSince: parseInputMapping(configuration).get('changed_since', ''),
      grain: parametersTable.get('grain') || List()
    });
  },

  createEmptyConfiguration(name) {
    return createConfiguration(fromJS({tableId: name, grain: null}));
  }
};
