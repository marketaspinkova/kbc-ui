import StoreUtils from '../../../utils/StoreUtils';
import { Map } from 'immutable';
import dispatcher from '../../../Dispatcher';
import { ActionTypes } from './MenuToggleConstants';

let _store = Map({
  isOpen: false
});

const MenuToggleStore = StoreUtils.createStore({
  getIsOpen: () => _store.get('isOpen')
});

dispatcher.register(payload => {
  const action = payload.action;

  switch (action.type) {
    case ActionTypes.MENU_TOGGLE_OPEN:
      _store = _store.set('isOpen', true);
      return MenuToggleStore.emitChange();

    case ActionTypes.MENU_TOGGLE_CLOSE:
      _store = _store.set('isOpen', false);
      return MenuToggleStore.emitChange();

    default:
  }
});

export default MenuToggleStore;
