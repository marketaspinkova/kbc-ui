import configProvisioning from './configProvisioning';
import {Map, fromJS} from 'immutable';
const PATH = 'dimensions';
export default function(configId) {
  const {parameters, isSaving, saveParameters, updateLocalState, getLocalStateValue} = configProvisioning(configId);
  const savedDimensions = parameters.get('dimensions', Map());
  const localDimensions = getLocalStateValue(PATH, savedDimensions);

  function saveDimensions(newDimensions) {
    const newParams = parameters.set('dimensions', fromJS(newDimensions.dimensions));
    return saveParameters(newParams, 'update dimensions');
  }

  return {
    value: {dimensions: localDimensions.toJS()},
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue.dimensions)),
    disabled: isSaving,
    onSave: saveDimensions
  };
}
