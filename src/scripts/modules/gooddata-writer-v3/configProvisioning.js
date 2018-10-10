import {Map, List} from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';
import localStateProvisioning from './localStateProvisioning';

const COMPONENT_ID = 'keboola.gooddata-writer';
const INPUT_MAPPING_PATH = ['storage', 'input', 'tables'];

export default function(configId) {
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const {getLocalState, updateLocalState, deleteLocalStatePath} = localStateProvisioning(configId);
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
      return deleteLocalStatePath(pendingPath.concat(path)[0]);
    }
  }

  function saveConfigData(data, changeDescription = 'update configuration', waitingPath = 'confing') {
    // check default output bucket and save default if non set
    togglePending(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription).then(() => togglePending(waitingPath, false));
  }

  function saveParameters(newParameters, changeDescription = 'update parameters', waitingPath = 'parameters') {
    const newData = configData.set('parameters', newParameters);
    return saveConfigData(newData, changeDescription, waitingPath);
  }

  function saveInputMapping(newInputMapping, changeDescription = 'update input mapping', waitingPath = 'inputmapping') {
    const newData = configData.setIn(INPUT_MAPPING_PATH, newInputMapping);
    return saveConfigData(newData, changeDescription, waitingPath);
  }

  function saveInputMappingAndParameters(newInputMapping, newParameters, changeDescription = 'update input mapping and parameters', waitingPath = 'im&parameters') {
    const newData = configData
      .setIn(INPUT_MAPPING_PATH, newInputMapping)
      .set('parameters', newParameters);
    return saveConfigData(newData, changeDescription, waitingPath);
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
