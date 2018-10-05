import {Map} from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';

const COMPONENT_ID = 'keboola.gooddata-writer';

export default function(configId) {
  function getLocalState() {
    return InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  }
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();

  function updateLocalState(path, data) {
    const ls = getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function deleteLocalStatePath(path) {
    const ls = getLocalState();
    const newLocalState = ls.deleteIn([].concat(path));
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  const parameters = configData.get('parameters', Map());
  const tables = parameters.get('tables', Map());
  const pendingPath = ['pending'];

  function isPending(path = []) {
    return getLocalState().hasIn(pendingPath.concat(path));
  }
  function togglePending(path, value) {
    if (value) {
      return updateLocalState(pendingPath.concat(path), true);
    } else {
      return deleteLocalStatePath(pendingPath.concat(path));
    }
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    // check default output bucket and save default if non set
    togglePending(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription).then(() => togglePending(waitingPath, false));
  }

  function saveTable(tableId, data, changeDescription) {
    const newData = configData.setIn(['parameters', 'tables', tableId], data);
    return saveConfigData(newData, tableId, changeDescription);
  }

  return {
    saveTable,
    togglePending,
    isPending,
    configData,
    tables,
    parameters
  };
}
