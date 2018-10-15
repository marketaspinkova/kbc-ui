import configProvisioning from '../configProvisioning';
import {fromJS} from 'immutable';


export default function(configId) {
  const {saveParameters, isSaving, parameters} = configProvisioning(configId);
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
