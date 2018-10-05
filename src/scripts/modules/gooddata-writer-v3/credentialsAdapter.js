import configProvisioning from './configProvisioning';
import {Map, fromJS} from 'immutable';
const PATH = 'credentials';

export default function(configId) {
  const {parameters, isSaving, saveParameters, updateLocalState, getLocalStateValue} = configProvisioning(configId);

  const savedCredentials = Map({
    pid: parameters.getIn(['project', 'pid'], ''),
    login: parameters.getIn(['user', 'login'], ''),
    password: parameters.getIn(['user', '#password'], '')
  });
  const localCredentials = getLocalStateValue(PATH, savedCredentials);

  function saveCredentials(value) {
    const newParams = parameters
      .setIn(['project', 'pid'], value.pid)
      .setIn(['user', 'login'], value.login)
      .setIn(['user', '#password'], value.password);
    return saveParameters(newParams, 'update credentials');
  }

  return {
    value: localCredentials.toJS(),
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue)),
    disabled: isSaving,
    onSave: saveCredentials
  };
}
