import { Map, fromJS } from 'immutable';
const inputMappingPath = ['storage', 'input', 'tables'];
export function parseInputMapping(configuration) {
  return configuration.getIn([...inputMappingPath, 0], Map());
}
export function createInputMapping(inputMapping) {
  return Map().setIn(inputMappingPath, fromJS([inputMapping]));
}
