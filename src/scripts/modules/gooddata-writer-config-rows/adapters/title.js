import Immutable, {Map} from 'immutable';
import {parseParameters, createConfigParameters} from '../helpers/rowTableParameters';

const createConfiguration = (localState) => {
  return createConfigParameters(localState);
};

export default {
  createConfiguration,
  parseConfiguration(configuration) {
    const parametersTable = parseParameters(configuration);
    return Map({
      tableId: parametersTable.get('tableId'),
      title: parametersTable.get('title'),
      identifier: parametersTable.get('identifier')
    });
  },

  createEmptyConfiguration(name, webalizedName) {
    const initState = {
      tableId: name,
      title: webalizedName,
      identifier: ''
    };
    return createConfiguration(Immutable.fromJS(initState));
  }
};
