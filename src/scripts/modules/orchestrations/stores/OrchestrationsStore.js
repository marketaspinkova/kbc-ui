import Dispatcher from '../../../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import matchByWords from '../../../utils/matchByWords';
import StoreUtils from '../../../utils/StoreUtils';

let _store = Map({
  orchestrationsById: Map(),
  orchestrationsPendingActions: Map(), // by orchestration id
  tasksToRun: Map(), // [orchestrationId] - tasks
  editing: Map(), // [orchestrationId][tasks] - edit value
  saving: Map(), // [orchestrationId][tasks] - bool value
  orchestrationTasksById: Map(),
  filter: '',
  sortByNameOption: null,
  isLoading: false,
  isLoaded: false,
  loadingOrchestrations: List()
});

const addEmptyPhase = tasks => {
  const phaseIds = tasks.map(phase => phase.get('id')).toJS();
  let newId = 'New phase';
  let idx = 1;
  while (phaseIds.includes(newId)) {
    newId = `New phase ${++idx}`;
  }
  const newPhase = Map({
    id: newId,
    tasks: List()
  });
  return tasks.push(newPhase);
};

const updateOrchestration = (store, id, payload) =>
  store.updateIn(['orchestrationsById', id], orchestration => orchestration.merge(payload));

const removeOrchestrationFromLoading = (store, id) =>
  store.update('loadingOrchestrations', loadingOrchestrations =>
    loadingOrchestrations.remove(store.get('loadingOrchestrations').indexOf(id))
  );

const setLastExecutedJob = (store, orchestrationId, job) => {
  const orchestration = store.getIn(['orchestrationsById', orchestrationId]);
  if (!orchestration || !orchestration.get('lastExecutedJob')) {
    return store;
  }
  if (orchestration.getIn(['lastExecutedJob', 'id']) > job.get('id')) {
    return store;
  }

  // set only if job is newer or same
  return store.setIn(['orchestrationsById', orchestrationId, 'lastExecutedJob'], job);
};

const OrchestrationStore = StoreUtils.createStore({
  /*
    Returns all orchestrations sorted by last execution date desc
  */
  getAll() {
    return _store
      .get('orchestrationsById')
      .sortBy(orchestration => orchestration.get('name'))
      .sortBy(orchestration => {
        const date = orchestration.getIn(['lastExecutedJob', 'startTime']);
        if (date) {
          return -1 * new Date(date).getTime();
        } else {
          return null;
        }
      });
  },

  getPendingActions() {
    return _store.get('orchestrationsPendingActions');
  },

  getPendingActionsForOrchestration(id) {
    return this.getPendingActions().get(id, Map());
  },

  /*
    Returns orchestration specified by id
  */
  get(id) {
    return _store.getIn(['orchestrationsById', id]);
  },

  has(id) {
    return _store.get('orchestrationsById').has(id);
  },

  getAllOrchestrationsTasks() {
    return _store.get('orchestrationTasksById');
  },

  getOrchestrationTasks(orchestrationId) {
    return _store.getIn(['orchestrationTasksById', orchestrationId]);
  },

  hasOrchestrationTasks(orchestrationId) {
    return _store.get('orchestrationTasksById').has(orchestrationId);
  },

  isEditing(orchestrationId, field) {
    return _store.hasIn(['editing', orchestrationId, field]);
  },

  isSaving(orchestrationId, field) {
    return _store.hasIn(['saving', orchestrationId, field]);
  },

  getEditingValue(orchestrationId, field) {
    return _store.getIn(['editing', orchestrationId, field]);
  },

  getTasksToRun(orchestrationId) {
    return _store.getIn(['tasksToRun', orchestrationId]);
  },

  getAllOrchestrationsTasksToRun() {
    return _store.get('tasksToRun');
  },

  /*
    Returns all orchestrations filtered by current filter value
  */
  getFiltered() {
    const filter = this.getFilter();
    return this.getAll().filter(orchestration => {
      if (filter) {
        return matchByWords(orchestration.get('name').toLowerCase(), filter.toLowerCase());
      } else {
        return true;
      }
    });
  },

  getFilter() {
    return _store.get('filter');
  },

  getSortByNameOption() {
    return _store.get('sortByNameOption');
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsOrchestrationLoading(id) {
    return _store.get('loadingOrchestrations').contains(id);
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  }
});

Dispatcher.register(payload => {
  const { action } = payload;
  let tasks = [];

  switch (action.type) {
    case ActionTypes.ORCHESTRATIONS_SET_FILTER:
      _store = _store.set('filter', action.query);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_START:
      _store = _store.setIn(['orchestrationsPendingActions', action.orchestrationId, 'active'], true);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_ERROR:
      _store = _store.deleteIn(['orchestrationsPendingActions', action.orchestrationId, 'active']);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_SUCCESS:
      _store = _store.withMutations(store => {
        store.deleteIn(['orchestrationsPendingActions', action.orchestrationId, 'active']);
        return updateOrchestration(store, action.orchestrationId, { active: action.active });
      });
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATIONS_LOAD:
      _store = _store.set('isLoading', true);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATIONS_LOAD_ERROR:
      _store = _store.set('isLoading', false);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATIONS_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .set('isLoading', false)
          .set('isLoaded', true)
          .set(
            'orchestrationsById',
            fromJS(action.orchestrations)
              .toMap()
              .mapKeys((key, orchestration) => orchestration.get('id'))
          )
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_LOAD:
      _store = _store.update('loadingOrchestrations', loadingOrchestrations =>
        loadingOrchestrations.push(action.orchestrationId)
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_DELETE_START:
      _store = _store.setIn(['orchestrationsPendingActions', action.orchestrationId, 'delete'], true);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_DELETE_ERROR:
      _store = _store.deleteIn(['orchestrationsPendingActions', action.orchestrationId, 'delete']);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_DELETE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .removeIn(['orchestrationsById', action.orchestrationId])
          .removeIn(['orchestrationsPendingActions', action.orchestrationId, 'delete'])
      );

      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_LOAD_ERROR:
      _store = removeOrchestrationFromLoading(_store, action.orchestrationId);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        removeOrchestrationFromLoading(store, action.orchestration.id)
          .setIn(['orchestrationsById', action.orchestration.id], fromJS(action.orchestration))
          .setIn(['orchestrationTasksById', action.orchestration.id], fromJS(action.orchestration.tasks))
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_CREATE_SUCCESS:
      _store = _store.setIn(['orchestrationsById', action.orchestration.id], fromJS(action.orchestration));
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS:
      // try to update orchestration latest job
      _store = setLastExecutedJob(_store, action.job.orchestrationId, fromJS(action.job));
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOBS_LOAD_SUCCESS:
      // try to update orchestration latest job

      let latestJob = fromJS(action.jobs).last();
      if (latestJob) {
        _store = setLastExecutedJob(_store, parseInt(action.orchestrationId, 10), latestJob);
        return OrchestrationStore.emitChange();
      }
      break;

    case ActionTypes.ORCHESTRATION_FIELD_EDIT_START:
      _store = _store.setIn(
        ['editing', action.orchestrationId, action.field],
        OrchestrationStore.get(action.orchestrationId).get(action.field)
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_FIELD_EDIT_CANCEL:
      _store = _store.deleteIn(['editing', action.orchestrationId, action.field]);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_FIELD_EDIT_UPDATE:
      _store = _store.setIn(['editing', action.orchestrationId, action.field], action.value);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_FIELD_SAVE_START:
      _store = _store.setIn(['saving', action.orchestrationId, action.field], true);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_FIELD_SAVE_ERROR:
      _store = _store.deleteIn(['saving', action.orchestrationId, action.field]);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_FIELD_SAVE_SUCCESS:
      _store = _store.withMutations(store => {
        if (action.orchestration) {
          store.setIn(['orchestrationsById', action.orchestrationId], fromJS(action.orchestration));
        } else if (action[action.field]) {
          store.setIn(['orchestrationsById', action.orchestrationId, action.field], fromJS(action[action.field]));
        }
        return store
          .deleteIn(['saving', action.orchestrationId, action.field])
          .deleteIn(['editing', action.orchestrationId, action.field]);
      });
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_START:
      _store = _store.setIn(
        ['tasksToRun', action.orchestrationId],
        OrchestrationStore.getOrchestrationTasks(action.orchestrationId)
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_CANCEL:
      _store = _store.deleteIn(['tasksToRun', action.orchestrationId]);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_SUCCESS:
      _store = _store.deleteIn(['tasksToRun', action.orchestrationId]);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_UPDATE:
      _store = _store.setIn(['tasksToRun', action.orchestrationId], action.tasks);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_TASKS_EDIT_START:
      tasks = addEmptyPhase(OrchestrationStore.getOrchestrationTasks(action.orchestrationId));
      _store = _store.setIn(['editing', action.orchestrationId, 'tasks'], tasks);

      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_TASKS_EDIT_CANCEL:
      _store = _store.deleteIn(['editing', action.orchestrationId, 'tasks']);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_TASKS_EDIT_UPDATE:
      tasks = action.tasks;
      if (!tasks.find(phase => phase.get('tasks').count() === 0)) {
        tasks = addEmptyPhase(tasks);
      }
      _store = _store.setIn(['editing', action.orchestrationId, 'tasks'], tasks);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_TASKS_SAVE_START:
      _store = _store.setIn(['saving', action.orchestrationId, 'tasks'], true);
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATION_TASKS_SAVE_ERROR:
      return (_store = _store.deleteIn(['saving', action.orchestrationId, 'tasks'], OrchestrationStore.emitChange()));

    case ActionTypes.ORCHESTRATION_TASKS_SAVE_SUCCESS:
      _store = _store.withMutations(store =>
        store
          .setIn(['orchestrationTasksById', action.orchestrationId], fromJS(action.tasks))
          .deleteIn(['saving', action.orchestrationId, 'tasks'])
          .deleteIn(['editing', action.orchestrationId, 'tasks'])
      );
      return OrchestrationStore.emitChange();

    case ActionTypes.ORCHESTRATIONS_LIST_SORT_BY_NAME:
      _store = _store.set('sortByNameOption', action.option);
      return OrchestrationStore.emitChange();

    default:
  }
});

export default OrchestrationStore;
