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
  if (currentState.has(constants.COMPONENT_NAMESPACE)) {
    return currentState.set(constants.COMPONENT_NAMESPACE, Immutable.Map());
  } else {
    return Immutable.fromJS({});
  }
};

const removeTableFromInputTableState = function(currentState, tableId) {
  const path = [constants.STORAGE_NAMESPACE, constants.INPUT_NAMESPACE, constants.TABLES_NAMESPACE];
  if (currentState.hasIn(path)) {
    return currentState
      .setIn(
        path,
        currentState
          .getIn(path)
          .filter((input) => input.get('source') !== tableId)
      );
  }
  return currentState;
};

export {
  constants,
  isEmptyComponentState,
  emptyComponentState,
  removeTableFromInputTableState
}
