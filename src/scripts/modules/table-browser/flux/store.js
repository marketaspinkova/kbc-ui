import Dispatcher from '../../../Dispatcher';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import {Map} from 'immutable';
import keyMirror from 'fbjs/lib/keyMirror';

export const ActionTypes = keyMirror({TABLEBROWSER_SET_LOCALSTATE: null, TABLEBROWSER_SET_CURRENT_TABLEID: null});

let _store = initStore('TableBrowserStore', Map({
  currentTableId: null,
  localStateByTableId: Map()
}));

const TableBrowserStore = StoreUtils.createStore({

  getCurrentTableId() {
    return _store.get('currentTableId');
  },

  getLocalState(tableId) {
    return _store.getIn(['localStateByTableId', tableId], Map());
  },

  getCurrenTableLocalState() {
    return this.getLocalState(this.getCurrentTableId());
  }
});

Dispatcher.register((payload) => {
  const action = payload.action;
  switch (action.type) {
    case ActionTypes.TABLEBROWSER_SET_LOCALSTATE:
      _store = _store.setIn(['localStateByTableId', action.tableId], action.localState);
      TableBrowserStore.emitChange();
      break;
    case ActionTypes.TABLEBROWSER_SET_CURRENT_TABLEID:
      _store = _store.set('currentTableId', action.tableId);
      if (action.localState) {
        _store = _store.setIn(['localStateByTableId', action.tableId], action.localState);
      }
      TableBrowserStore.emitChange();
      break;
    default:
      break;
  }
});

export default TableBrowserStore;
