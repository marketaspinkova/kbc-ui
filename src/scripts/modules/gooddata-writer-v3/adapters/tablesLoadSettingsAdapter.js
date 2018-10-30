import {fromJS} from 'immutable';

export default function(configProvisioning) {
  const {saveParameters, isSaving, parameters} = configProvisioning;
  const value = {
    loadOnly: parameters.get('loadOnly', false),
    multiLoad: parameters.get('multiLoad', false)
  };

  function onSave(newValue) {
    const newParameters = parameters.merge(fromJS(newValue));
    return saveParameters(newParameters, 'update tables load settings');
  }

  return {
    value,
    onSave,
    disabled: isSaving
  };
}
