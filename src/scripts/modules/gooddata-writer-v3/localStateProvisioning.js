import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';
import { Map } from 'immutable';
const COMPONENT_ID = 'keboola.gooddata-writer';

export default function(configId) {
  function getLocalState() {
    return InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  }
  function getLocalStateValue(path, defaultValue) {
    return getLocalState().getIn([].concat(path), defaultValue);
  }
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

  return {
    getLocalState,
    getLocalStateValue,
    updateLocalState,
    deleteLocalStatePath
  };
}
