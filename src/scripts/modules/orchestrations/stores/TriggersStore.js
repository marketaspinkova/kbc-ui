import Dispatcher from '../../../Dispatcher';
import { Map, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import StoreUtils from '../../../utils/StoreUtils';

let _store = Map({
  trigger: Map(),
  isLoaded: false
});

const TriggersStore = StoreUtils.createStore({
  get() {
    return _store.get('trigger');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case ActionTypes.ORCHESTRATION_TRIGGERS_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('isLoaded', true)
          .set('trigger', fromJS(action.triggers).first())
      );
      return TriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_DELETE_SUCCESS:
      _store = _store.set('trigger', null);
      return TriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_CREATE_SUCCESS:
      _store = _store.set('trigger', fromJS(action.trigger));
      return TriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_UPDATE_SUCCESS:
      _store = _store.set('trigger', fromJS(action.trigger));
      return TriggersStore.emitChange();

    default:
  }
});

export default TriggersStore;
