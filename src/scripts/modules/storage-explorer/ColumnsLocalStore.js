import { Map, Set } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';

let _store = Map({
  openedColumns: Set()
});

const ColumnsLocalStore = StoreUtils.createStore({
  getOpenedColumns() {
    return _store.get('openedColumns');
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.SET_OPENED_COLUMNS:
      _store = _store.set('openedColumns', action.columns);
      return ColumnsLocalStore.emitChange();

    default:
      break;
  }
});

export default ColumnsLocalStore;
