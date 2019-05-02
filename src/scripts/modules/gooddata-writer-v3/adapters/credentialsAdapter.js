import {Map, fromJS} from 'immutable';
const PATH = 'credentials';
import GoodDataProvisioningStore from '../gooddataProvisioning/store';

export default function(configProvisioning, localStateProvisioning) {
  const {parameters, isSaving, saveParameters} = configProvisioning;
  const {updateLocalState, getLocalStateValue} = localStateProvisioning;
  const pid = parameters.getIn(['project', 'pid'], '');
  const goodDataProvisioningData = GoodDataProvisioningStore.getData(pid);
  const savedCredentials = Map({
    pid: pid,
    login: parameters.getIn(['user', 'login'], ''),
    password: parameters.getIn(['user', '#password'], ''),
    backendUrl: parameters.getIn(['project', 'backendUrl'], '')
  });
  const localCredentials = getLocalStateValue(PATH, savedCredentials);

  function saveCredentials(value) {
    const newParams = parameters
      .setIn(['project', 'pid'], value.pid)
      .setIn(['project', 'backendUrl'], value.backendUrl)
      .setIn(['user', 'login'], value.login)
      .setIn(['user', '#password'], value.password);
    return saveParameters(newParams, 'update credentials').then(() => updateLocalState(PATH, fromJS(value)));
  }

  const isComplete = !!savedCredentials.get('pid');
  const token = goodDataProvisioningData && goodDataProvisioningData.get('token', '');
  return {
    value: {token, ...localCredentials.toJS()},
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue)),
    disabled: isSaving,
    onSave: saveCredentials,
    isComplete
  };
}
