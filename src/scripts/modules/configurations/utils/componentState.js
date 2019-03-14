import Immutable from 'immutable';

const constants = {
  COMPONENT_NAMESPACE_PREFIX: 'component'
};

const isEmptyComponentState = function(state) {
  if (state.isEmpty()) {
    return true;
  }
  if (state.has(constants.COMPONENT_NAMESPACE_PREFIX) && state.get(constants.COMPONENT_NAMESPACE_PREFIX).isEmpty()) {
    return true;
  }
  return false;
};

const emptyComponentState = function(currentState) {
  if (currentState.has('component')) {
    return currentState.set(constants.COMPONENT_NAMESPACE_PREFIX, Immutable.Map());
  } else {
    return Immutable.fromJS({});
  }
};

export {
  constants,
  isEmptyComponentState,
  emptyComponentState
}
