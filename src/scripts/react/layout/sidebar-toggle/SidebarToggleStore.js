import StoreUtils from '../../../utils/StoreUtils';
import { Map } from 'immutable';
import dispatcher from '../../../Dispatcher';
import { ActionTypes } from './SidebarToggleConstants';

let _store = Map({
  isOpen: false
});

const SidebarToggleStore = StoreUtils.createStore({
  getIsOpen: () => _store.get('isOpen')
});

dispatcher.register(payload => {
  const action = payload.action;

  switch (action.type) {
    case ActionTypes.SIDEBAR_TOGGLE_OPEN:
      _store = _store.set('isOpen', true);
      return SidebarToggleStore.emitChange();

    case ActionTypes.SIDEBAR_TOGGLE_CLOSE:
      _store = _store.set('isOpen', false);
      return SidebarToggleStore.emitChange();

    default:
  }
});

export default SidebarToggleStore;
