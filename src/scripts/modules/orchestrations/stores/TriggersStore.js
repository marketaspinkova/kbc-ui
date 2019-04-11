import Dispatcher from '../../../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import StoreUtils from '../../../utils/StoreUtils';

let _store = Map({
  triggers: Map(),
  editing: Map(),
  saving: Map(),
  filter: '',
  isLoading: false,
  isLoaded: false,
  loadingTriggers: List()
});

// const updateTrigger = (store, id, payload) =>
//   store.updateIn(['triggers', id], trigger => trigger.merge(payload));

const TriggersStore = StoreUtils.createStore({

  getAll() {
    return _store.get('triggers');
  },

  getByConfigId(id) {
    return _store.getIn(['triggers', id]);
  },

  hasForConfigId(id) {
    return _store.get('triggers').has(id);
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsTriggerLoading(id) {
    return _store.get('loadingTriggers').contains(id);
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case ActionTypes.TRIGGERS_LOAD:
      _store = _store.set('isLoading', true);
      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('isLoading', false)
          .set('isLoaded', true)
          .set(
            'triggers',
            fromJS(action.triggers)
              .toMap()
              .mapKeys((key, item) => item.get('id'))
          )
      );
      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_DELETE_START:
      _store = _store.setIn(['orchestrationsPendingActions', action.orchestrationId, 'delete'], true);
      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_DELETE_ERROR:
      _store = _store.deleteIn(['orchestrationsPendingActions', action.orchestrationId, 'delete']);
      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_DELETE_SUCCESS:
      _store = _store.withMutations(store =>
        store.removeIn(['triggers', action.triggerId])
      );

      return TriggersStore.emitChange();

    case ActionTypes.TRIGGERS_CREATE_SUCCESS:
      _store = _store.setIn(['orchestrationsById', action.orchestration.id], fromJS(action.orchestration));
      return TriggersStore.emitChange();

    default:
  }
});

export default TriggersStore;
