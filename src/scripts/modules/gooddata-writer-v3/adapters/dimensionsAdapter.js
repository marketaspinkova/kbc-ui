import {Map, fromJS} from 'immutable';
const PATH = 'dimensions';
export default function(configProvisioning, localStateProvisioning) {
  const {parameters, isSaving, saveParameters} = configProvisioning;
  const {updateLocalState, getLocalStateValue} = localStateProvisioning;
  const savedDimensions = parameters.get('dimensions', Map());
  const localDimensions = getLocalStateValue(PATH, savedDimensions);
  const isUpdated = getLocalStateValue('dimensionsUpdated', false);

  function saveDimensions(value) {
    const newParams = parameters.set('dimensions', fromJS(value.dimensions));
    return saveParameters(newParams, 'update dimensions').then(
      () => updateLocalState('dimensionsUpdated', true)
    );
  }

  const isComplete = savedDimensions.count() > 0 && !isUpdated;

  return {
    value: {dimensions: localDimensions.toJS()},
    onChange: (newValue) => updateLocalState(PATH, fromJS(newValue.dimensions)),
    disabled: isSaving,
    onSave: saveDimensions,
    isComplete
  };
}
