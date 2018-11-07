import {Map, fromJS} from 'immutable';
const PATH = 'credentials';

export default function(configProvisioning, localStateProvisioning) {
  const {parameters, isSaving, saveParameters} = configProvisioning;
  const {updateLocalState, getLocalStateValue} = localStateProvisioning;

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
    return saveParameters(newParams, 'update credentials').then(() => updateLocalState(PATH, fromJS(value)));
  }

  const isComplete = !!savedCredentials.get('pid');

  return {
    value: localCredentials.toJS(),
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue)),
    disabled: isSaving,
    onSave: saveCredentials,
    isComplete
  };
}
