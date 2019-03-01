import { Map, List, fromJS } from 'immutable';
import StoreUtils from '../../../utils/StoreUtils';
import * as constants from '../Constants';
import Dispatcher from '../../../Dispatcher';

let _store = Map({
  jobsById: Map(),
  loadingJobs: List(),
  terminatingJobs: List(), // waiting for terminate request send
  query: '',
  isLoading: false,
  isLoaded: false,
  isLoadMore: true,
  loadJobsErrorCnt: 0,
  limit: 50,
  offset: 0
});

const JobsStore = StoreUtils.createStore({
  loadJobsErrorCount() {
    return _store.get('loadJobsErrorCnt', 0);
  },

  getAll() {
    return _store.get('jobsById').sortBy(job => {
      const date = job.get('createdTime');
      if (date) {
        return -1 * new Date(date).getTime();
      } else {
        return null;
      }
    });
  },

  get(id) {
    return _store.getIn(['jobsById', id]);
  },

  has(id) {
    return _store.hasIn(['jobsById', id]);
  },

  getIsLoading() {
    return _store.get('isLoading');
  },

  getIsLoaded() {
    return _store.get('isLoaded');
  },

  getQuery() {
    return _store.get('query');
  },

  getLimit() {
    return _store.get('limit');
  },

  getOffset() {
    return _store.get('offset');
  },

  getNextOffset() {
    return _store.get('offset') + _store.get('limit');
  },

  getIsLoadMore() {
    return _store.get('isLoadMore');
  },

  getIsJobLoading(jobId) {
    return _store.get('loadingJobs').contains(jobId);
  },

  getIsJobTerminating(jobId) {
    return _store.get('terminatingJobs').contains(jobId);
  },

  getUserRunnedParentJob(configurationJob) {
    let job = configurationJob;

    if (job.get('nestingLevel') > 0 && !job.hasIn(['params', 'config'])) {
      const jobs = this.getAll();
      const runIdParts = job.get('runId', []).split('.');
      let parentRunId = '';
      let parentJob = null;

      for (let index = 1; index <= runIdParts.length; index++) {
        parentRunId = runIdParts.slice(0, index * -1).join('.');
        parentJob = jobs.find((job) => job.get('runId') === parentRunId && job.hasIn(['params', 'config']));

        if (parentJob && parentJob.count() > 0) {
          job = parentJob;
          break;
        }
      }
    }

    return job;
  }
});

JobsStore.dispatchToken = Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.JOB_LOAD:
      _store = _store.update('loadingJobs', loadingJobs => loadingJobs.push(action.jobId));
      return JobsStore.emitChange();

    case constants.ActionTypes.JOBS_LOAD:
      _store = _store.set('isLoading', true);
      return JobsStore.emitChange();

    case constants.ActionTypes.JOBS_LOAD_ERROR:
      _store = _store.delete('isLoading');
      if (action.exception && action.exception.response && action.exception.response.status === 401) {
        _store = _store.set('loadJobsErrorCnt', _store.get('loadJobsErrorCnt', 0) + 1);
      }
      return JobsStore.emitChange();

    // LOAD MORE JOBS FROM API and merge with current jobs
    case constants.ActionTypes.JOBS_LOAD_SUCCESS:
      if (action.resetJobs) {
        _store = _store.set('jobsById', Map());
      }
      _store = _store.withMutations(store =>
        store
          .set('loadJobsErrorCnt', 0)
          .set('isLoading', false)
          .set('isLoaded', true)
          .set('offset', action.newOffset)
          .mergeIn(
            ['jobsById'],
            fromJS(action.jobs)
              .toMap()
              .map(job => job.set('id', parseInt(job.get('id'), 10)))
              .mapKeys((key, job) => job.get('id'))
          )
      );

      var loadMore = true;
      if (_store.get('jobsById').count() < _store.get('offset') + _store.get('limit')) {
        loadMore = false;
      }
      _store = _store.set('isLoadMore', loadMore);
      return JobsStore.emitChange();

    // RESET QUERY and OFFSET and jobs
    case constants.ActionTypes.JOBS_SET_QUERY:
      _store = _store.withMutations(store => store.set('query', action.query.trim()).set('offset', 0));
      return JobsStore.emitChange();

    case constants.ActionTypes.JOB_LOAD_SUCCESS:
      _store = _store.withMutations(store => {
        const jobId = parseInt(action.job.id, 10);
        const job = fromJS(action.job).set('id', jobId);
        store
          .setIn(['jobsById', jobId], job)
          .update('loadingJobs', loadingJobs => loadingJobs.remove(loadingJobs.indexOf(jobId)));
      });

      return JobsStore.emitChange();

    case constants.ActionTypes.JOB_TERMINATE_START:
      _store = _store.update('terminatingJobs', jobs => jobs.push(action.jobId));
      return JobsStore.emitChange();

    case constants.ActionTypes.JOB_TERMINATE_SUCCESS:
    case constants.ActionTypes.JOB_TERMINATE_ERROR:
      _store = _store.update('terminatingJobs', jobs => jobs.remove(jobs.indexOf(action.jobId)));
      return JobsStore.emitChange();

    default:
      break;
  }
});

export default JobsStore;
