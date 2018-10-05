import {Map, List} from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';

const COMPONENT_ID = 'keboola.gooddata-writer';
const INPUT_MAPPING_PATH = ['storage', 'input', 'tables'];

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
  const inputMapping = configData.getIn(INPUT_MAPPING_PATH, List());
  const pendingPath = ['pending'];

  function isPendingFn(path = []) {
    return getLocalState().hasIn(pendingPath.concat(path));
  }
  function togglePending(path, value) {
    if (value) {
      return updateLocalState(pendingPath.concat(path), true);
    } else {
      return deleteLocalStatePath(pendingPath.concat(path));
    }
  }

  function saveConfigData(data, changeDescription = 'update configuration', waitingPath = 'confing') {
    // check default output bucket and save default if non set
    togglePending(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription).then(() => togglePending(waitingPath, false));
  }

  function saveParameters(newParameters, changeDescription = 'update parameters', waitingPath = 'parameters') {
    const newData = configData.set('parameters', newParameters);
    return saveConfigData(newData, waitingPath, changeDescription);
  }

  function saveInputMapping(newInputMapping, changeDescription = 'update input mapping', waitingPath = 'inputmapping') {
    const newData = configData.setIn(INPUT_MAPPING_PATH, newInputMapping);
    return saveConfigData(newData, waitingPath, changeDescription);
  }

  function saveInputMappingAndParameters(newInputMapping, newParameters, changeDescription = 'update input mapping and parameters', waitingPath = 'im&parameters') {
    const newData = configData
      .setIn(INPUT_MAPPING_PATH, newInputMapping)
      .set('parameters', newParameters);
    return saveConfigData(newData, waitingPath, changeDescription);
  }

  return {
    configData,
    parameters,
    inputMapping,
    saveConfigData,
    saveParameters,
    saveInputMapping,
    saveInputMappingAndParameters,
    togglePending,
    isPendingFn,
    isSaving: getLocalState().getIn(pendingPath, Map()).count() > 0
  };
}
