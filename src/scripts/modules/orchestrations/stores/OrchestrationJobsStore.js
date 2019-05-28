import Dispatcher from '../../../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import { ActionTypes } from '../Constants';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';

let _store = initStore('OrchestrationJobsStore', Map({
  jobsByOrchestrationId: Map(),
  editing: Map(), // [jobId][tasks] - edit value
  loadingOrchestrationJobs: List(),
  loadingJobs: List(),
  terminatingJobs: List(),
  retryingJobs: List()
}));

const addToLoadingOrchestrations = (store, orchestrationId) =>
  store.update('loadingOrchestrationJobs', loadingOrchestrationJobs => loadingOrchestrationJobs.push(orchestrationId));

const removeFromLoadingOrchestrations = (store, orchestrationId) =>
  store.update('loadingOrchestrationJobs', loadingOrchestrationJobs =>
    loadingOrchestrationJobs.remove(loadingOrchestrationJobs.indexOf(orchestrationId))
  );

const addToLoadingJobs = (store, jobId) =>
  store.update('loadingJobs', loadingOrchestrationJobs => loadingOrchestrationJobs.push(jobId));

const removeFromLoadingJobs = (store, jobId) =>
  store.update('loadingJobs', loadingJobs => loadingJobs.remove(loadingJobs.indexOf(jobId)));

const addToTerminatingJobs = (store, jobId) => store.update('terminatingJobs', jobs => jobs.push(jobId));

const removeFromTerminatingJobs = (store, jobId) =>
  store.update('terminatingJobs', jobs => jobs.remove(jobs.indexOf(jobId)));

const setOrchestrationJob = (store, orchestrationId, job) => {
  const jobId = job.get('id');
  return store.updateIn(['jobsByOrchestrationId', orchestrationId], List(), jobs =>
    jobs.filter(item => item.get('id') !== jobId).push(job)
  );
};

const OrchestrationJobsStore = StoreUtils.createStore({
  /*
    Returns all jobs for orchestration sorted by id desc
  */
  getOrchestrationJobs(idOrchestration) {
    return _store.getIn(['jobsByOrchestrationId', idOrchestration], List()).sortBy(job => -1 * job.get('id'));
  },

  /*
    Check if store contains job for specifed orchestration
  */
  hasOrchestrationJobs(idOrchestration) {
    return _store.get('jobsByOrchestrationId').has(idOrchestration);
  },

  /*
    Returns one job by it's id
  */
  getJob(id) {
    let foundJob = null;
    _store.get('jobsByOrchestrationId').find(jobs => (foundJob = jobs.find(job => job.get('id') === id)));
    return foundJob;
  },

  getIsJobTerminating(id) {
    return _store.get('terminatingJobs').contains(id);
  },

  getIsJobRetrying(id) {
    return _store.get('retryingJobs').contains(id);
  },

  /*
    Test if job is currently being loaded
  */
  isJobLoading(idJob) {
    return _store.get('loadingJobs').contains(idJob);
  },

  /*
    Test if specified orchestration jobs are currently being loaded
  */
  isLoading(idOrchestration) {
    return _store.get('loadingOrchestrationJobs').contains(idOrchestration);
  },

  getEditingValue(jobId, field) {
    return _store.getIn(['editing', jobId, field]);
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case ActionTypes.ORCHESTRATION_JOBS_LOAD:
      _store = addToLoadingOrchestrations(_store, action.orchestrationId);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOBS_LOAD_ERROR:
      _store = removeFromLoadingOrchestrations(_store, action.orchestrationId);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOBS_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        removeFromLoadingOrchestrations(store, action.orchestrationId).update(
          'jobsByOrchestrationId',
          jobsByOrchestrationId => {
            let jobs = jobsByOrchestrationId.get(action.orchestrationId, List());
            // append new jobs preserving already existing ones in the
            // orchestration jobs
            action.jobs.forEach(newJob => {
              jobs = jobs.filter(filterJob => filterJob.get('id') !== newJob.id);
              jobs = jobs.push(fromJS(newJob));
            });

            // set the new result jobs
            return jobsByOrchestrationId.set(action.orchestrationId, jobs);
          }
        )
      );
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_LOAD:
      _store = addToLoadingJobs(_store, action.jobId);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS:
      _store = _store.withMutations(store => {
        removeFromLoadingJobs(store, action.job.id);
        return setOrchestrationJob(store, action.job.orchestrationId, fromJS(action.job));
      });
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_TERMINATE_START:
      _store = addToTerminatingJobs(_store, action.jobId);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_TERMINATE_ERROR:
    case ActionTypes.ORCHESTRATION_JOB_TERMINATE_SUCCESS:
      _store = removeFromTerminatingJobs(_store, action.jobId);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_START:
      _store = _store.setIn(
        ['editing', action.jobId, 'tasks'],
        OrchestrationJobsStore.getJob(action.jobId).get('tasks')
      );
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_UPDATE:
      _store = _store.setIn(['editing', action.jobId, 'tasks'], action.tasks);
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_RETRY_START:
      _store = _store.update('retryingJobs', jobs => jobs.push(action.jobId));
      return OrchestrationJobsStore.emitChange();

    case ActionTypes.ORCHESTRATION_JOB_RETRY_SUCCESS:
    case ActionTypes.ORCHESTRATION_JOB_RETRY_ERROR:
      _store = _store.update('retryingJobs', jobs => jobs.remove(jobs.indexOf(action.jobId)));
      return OrchestrationJobsStore.emitChange();

    default:
  }
});

export default OrchestrationJobsStore;
