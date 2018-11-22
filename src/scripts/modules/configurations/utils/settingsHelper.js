import Immutable from 'immutable';

export function findIndexAction(settings, actionName) {
  const action = settings.getIn(['index', 'actions'], Immutable.List()).find(actionItem => {
    return actionItem.get('name') === actionName;
  });
  if (!action) {
    throw new Error('Action ' + actionName + ' not found.');
  }
  return action;
}

export function findRowAction(settings, actionName) {
  let action = settings.getIn(['row', 'actions'], Immutable.List()).find(actionItem => {
    return actionItem.get('name') === actionName;
  });
  if (!action) {
    action = settings.getIn(['index', 'actions'], Immutable.List()).find(actionItem => {
      return actionItem.get('name') === actionName;
    });
  }
  if (!action) {
    throw new Error('Action ' + actionName + ' not found.');}

}

