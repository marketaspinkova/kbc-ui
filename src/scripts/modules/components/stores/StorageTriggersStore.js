import Dispatcher from '../../../Dispatcher';
import { Map, fromJS } from 'immutable';
import { ActionTypes } from '../../orchestrations/Constants';
import StoreUtils from '../../../utils/StoreUtils';

let _store = Map({
  trigger: Map(),
  isLoaded: false
});

const StorageTriggersStore = StoreUtils.createStore({
  get() {
    return _store.get('trigger');
  },

  getIsLoaded(orchestrationId) {
    return _store.getIn(['trigger', 'configurationId']) === orchestrationId;
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
      return StorageTriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_DELETE_SUCCESS:
      _store = _store.set('trigger', null);
      return StorageTriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_CREATE_SUCCESS:
      _store = _store.set('trigger', fromJS(action.trigger));
      return StorageTriggersStore.emitChange();

    case ActionTypes.ORCHESTRATION_TRIGGERS_UPDATE_SUCCESS:
      _store = _store.set('trigger', fromJS(action.trigger));
      return StorageTriggersStore.emitChange();

    default:
  }
});

export default StorageTriggersStore;
