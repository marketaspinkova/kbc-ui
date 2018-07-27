import StoreUtils from '../../../utils/StoreUtils';
import {Map} from 'immutable';
import keyMirror from 'fbjs/lib/keyMirror';
import dispatcher from '../../../Dispatcher';

export const ProvisioningActionTypes = keyMirror({
  GD_PROVISIONING_LOAD_START: null,
  GD_PROVISIONING_LOAD_SUCCESS: null,
  GD_PROVISIONING_LOAD_ERROR: null,
  GD_PROVISIONING_CREATE_START: null,
  GD_PROVISIONING_CREATE_SUCCESS: null,
  GD_PROVISIONING_CREATE_ERROR: null
});

let _store = Map({
  isCreating: false,
  isLoading: Map(),
  provisioning: Map() // pid -> {}
});

const ProvisioningStore = StoreUtils.createStore({
  getIsCreating: () => _store.getIn(['isCreating'], false),
  getIsLoading: (pid) => _store.getIn(['isLoading', pid], false),
  getData: (pid) => _store.getIn(['provisioning', pid], Map())
});

dispatcher.register(payload => {
  const {action} = payload;
  switch (action.type) {
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_START:
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], true);
      return ProvisioningStore.emitChange();
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_SUCCESS:
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], false);
      _store = _store.setIn(['provisioning', pid], action.data);
      return ProvisioningStore.emitChange();
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR:
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], false);
      return ProvisioningStore.emitChange();

    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_START:
      _store = _store.setIn(['isCreating'], true);
      return ProvisioningStore.emitChange();
    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_SUCCESS:
      const {data} = action;
      _store = _store.setIn(['isCreating'], false);
      _store = _store.setIn(['provisioning', data.pid], data);
      return ProvisioningStore.emitChange();
    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_ERROR:
      _store = _store.setIn(['isCreating'], false);
      return ProvisioningStore.emitChange();
    default:
  }
});
