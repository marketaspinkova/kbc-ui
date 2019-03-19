import { Map, List } from 'immutable';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import componentsActions from '../components/InstalledComponentsActionCreators';
import localStateProvisioning from './localStateProvisioning';

const COMPONENT_ID = 'keboola.gooddata-writer';
const INPUT_MAPPING_PATH = ['storage', 'input', 'tables'];

export default function(configId) {
  const config = InstalledComponentStore.getConfig(COMPONENT_ID, configId);
  const configData = InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const { getLocalState, updateLocalState, deleteLocalStatePath } = localStateProvisioning(configId);
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

  function saveConfigData(data, changeDescription = 'update configuration', pendingAction = 'config') {
    togglePending(pendingAction, true);
    return componentsActions
      .saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription)
      .then(() => togglePending(pendingAction, false));
  }

  function saveParameters(newParameters, changeDescription = 'update parameters', pendingAction = 'parameters') {
    const newData = configData.set('parameters', newParameters);
    return saveConfigData(newData, changeDescription, pendingAction);
  }

  function saveInputMappingAndParameters(
    newInputMapping,
    newParameters,
    changeDescription = 'update input mapping and parameters',
    pendingAction = 'im&parameters'
  ) {
    const newData = configData.setIn(INPUT_MAPPING_PATH, newInputMapping).set('parameters', newParameters);
    return saveConfigData(newData, changeDescription, pendingAction);
  }

  return {
    config,
    configData,
    parameters,
    inputMapping,
    saveConfigData,
    saveParameters,
    saveInputMappingAndParameters,
    togglePending,
    isPendingFn,
    isSaving:
      getLocalState()
        .getIn(pendingPath, Map())
        .count() > 0
  };
}
