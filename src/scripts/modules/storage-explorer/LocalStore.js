import { Map } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = Map({
  isReloading: false
});

const LocalStore = StoreUtils.createStore({
  getIsReloading() {
    return _store.get('isReloading', false);
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.RELOAD:
      _store = _store.set('isReloading', true);
      return LocalStore.emitChange();

    case constants.ActionTypes.RELOAD_SUCCESS:
    case constants.ActionTypes.RELOAD_ERROR:
      _store = _store.set('isReloading', false);
      return LocalStore.emitChange();

    default:
      break;
  }
});

export default LocalStore;
