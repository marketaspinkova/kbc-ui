import StoreUtils from '../../../utils/StoreUtils';
import {Map, fromJS} from 'immutable';
import dispatcher from '../../../Dispatcher';
import {ProvisioningActionTypes} from '../helpers/Constants';

let _store = Map({
  isCreating: false,
  isLoading: Map(),
  isDeleting: Map(),
  provisioning: Map() // pid -> {}
});

const ProvisioningStore = StoreUtils.createStore({
  getIsCreating: () => _store.getIn(['isCreating'], false),
  getIsLoading: (pid) => _store.getIn(['isLoading', pid], false),
  getIsDeleting: (pid) => _store.getIn(['isDeleting', pid], false),
  getData: (pid) => pid ? _store.getIn(['provisioning', pid], null) : null
});

dispatcher.register(payload => {
  const {action} = payload;
  switch (action.type) {
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_START: {
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], true);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_SUCCESS: {
      const {pid} = action;
      _store = _store
        .setIn(['isLoading', pid], false)
        .setIn(['provisioning', pid], fromJS(action.data));
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_LOAD_ERROR: {
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], false);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_START: {
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], true);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_SUCCESS: {
      const {pid} = action;
      const {enable} = action;
      _store = _store.setIn(['isLoading', pid], false);
      if (enable) {
        _store = _store.setIn(['provisioning', pid, 'sso'], fromJS(action.data));
      } else {
        _store = _store.deleteIn(['provisioning', pid, 'sso']);
      }
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_ENABLESSO_ERROR: {
      const {pid} = action;
      _store = _store.setIn(['isLoading', pid], false);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_START: {
      _store = _store.setIn(['isCreating'], true);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_SUCCESS: {
      const {data} = action;
      _store = _store
        .setIn(['isCreating'], false)
        .setIn(['provisioning', data.pid], fromJS(data));
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_CREATE_ERROR: {
      _store = _store.setIn(['isCreating'], false);
      return ProvisioningStore.emitChange();
    }

    case ProvisioningActionTypes.GD_PROVISIONING_DELETE_START: {
      const {pid} = action;
      _store = _store.setIn(['isDeleting', pid], true);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_DELETE_SUCCESS: {
      const {pid} = action;
      _store = _store
        .setIn(['isDeleting', pid], false)
        .removeIn(['provisioning', pid]);
      return ProvisioningStore.emitChange();
    }
    case ProvisioningActionTypes.GD_PROVISIONING_DELETE_ERROR: {
      const {pid} = action;
      _store = _store.setIn(['isDeleting', pid], false);
      return ProvisioningStore.emitChange();
    }
    default:
  }
});
export default ProvisioningStore;
