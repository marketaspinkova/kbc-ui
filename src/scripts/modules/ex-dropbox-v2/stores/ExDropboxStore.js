import Dispatcher from '../../../Dispatcher';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import { Map } from 'immutable';
import { ActionTypes } from '../constants';

var dropboxStore = initStore('ExDropboxStore', Map({
  fileNames: Map()
}));

let ExDropboxStore = StoreUtils.createStore({
  getCsvFiles() {
    return dropboxStore;
  }
});

Dispatcher.register((payload) => {
  let action = payload.action;

  switch (action.type) {
    case ActionTypes.UPDATE_LIST_OF_CSV_FILES:
      dropboxStore = dropboxStore.set('fileNames', action.data);
      return ExDropboxStore.emitChange();
    default:
  }
});

export default ExDropboxStore;
