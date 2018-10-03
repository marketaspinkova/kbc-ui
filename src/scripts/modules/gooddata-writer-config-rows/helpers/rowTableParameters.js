import {Map, fromJS} from 'immutable';

export function parseParameters(configuration) {
  const params = configuration.getIn(['parameters', 'tables'], Map());
  const tableId = params.keySeq().first();
  return params.get(tableId, Map()).set('tableId', tableId);
}

export function createConfigParameters(localState) {
  const tableId = localState.get('tableId');
  return fromJS({
    parameters: {
      tables: {
        [tableId]: localState.remove('tableId')
      }
    }
  });
}
