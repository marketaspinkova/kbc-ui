import configProvisioning from '../configProvisioning';
import localStateProvisioning from '../localStateProvisioning';
import {Map, fromJS} from 'immutable';
const PATH = 'dimensions';
export default function(configId) {
  const {parameters, isSaving, saveParameters} = configProvisioning(configId);
  const {updateLocalState, getLocalStateValue} = localStateProvisioning(configId);
  const savedDimensions = parameters.get('dimensions', Map());
  const localDimensions = getLocalStateValue(PATH, savedDimensions);

  function saveDimensions(value) {
    const newParams = parameters.set('dimensions', fromJS(value.dimensions));
    return saveParameters(newParams, 'update dimensions');
  }

  const isComplete = savedDimensions.count() > 0;

  return {
    value: {dimensions: localDimensions.toJS()},
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue.dimensions)),
    disabled: isSaving,
    onSave: saveDimensions,
    isComplete
  };
}
