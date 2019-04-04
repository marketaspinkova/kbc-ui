import Immutable from 'immutable';

const constants = {
  COMPONENT_NAMESPACE: 'component',
  STORAGE_NAMESPACE: 'storage',
  INPUT_NAMESPACE: 'input',
  TABLES_NAMESPACE: 'tables',
  LAST_IMPORT_DATE_PROPERTY: 'lastImportDate'
};

const isEmptyComponentState = function(state) {
  if (state.isEmpty()) {
    return true;
  }
  if (state.has(constants.COMPONENT_NAMESPACE) && state.get(constants.COMPONENT_NAMESPACE).isEmpty()) {
    return true;
  }
  return false;
};

const emptyComponentState = function(currentState) {
  if (currentState.has('component')) {
    return currentState.set(constants.COMPONENT_NAMESPACE, Immutable.Map());
  } else {
    return Immutable.fromJS({});
  }
};

export {
  constants,
  isEmptyComponentState,
  emptyComponentState
}
