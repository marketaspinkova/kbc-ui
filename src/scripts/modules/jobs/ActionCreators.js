import Promise from 'bluebird';
import moment from 'moment';
import dispatcher from '../../Dispatcher';
import JobsStore from './stores/JobsStore';
import * as constants from './Constants';
import jobsApi from './JobsApi';
import RoutesStore from '../../stores/RoutesStore';
import storageActions from '../components/StorageActionCreators';

export default {
  reloadSapiTablesTrigger(jobs) {
    const tresholdTrigger = 20;
    for (let job of jobs) {
      if (job.endTime) {
        const endTime = moment(job.endTime);
        const now = moment();
        const diff = moment.duration(now.diff(endTime));
        if (diff < moment.duration(tresholdTrigger, 'seconds')) {
          return storageActions.loadTablesForce(true);
        }
      }
    }
  }, // ignore force if already isLoading

  loadJobs() {
    if (JobsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadJobsForce(JobsStore.getOffset(), false, true);
  },

  // poll for not finished jobs
  reloadNotFinishedJobs() {
    const allJobs = JobsStore.getAll()
      .filter(job => !job.get('isFinished'))
      .map(j => j.get('id'))
      .toArray();
    if (allJobs.length === 0) {
      return Promise.resolve();
    }
    const query = `(id:${allJobs.join(' OR id:')})`;
    return this.loadJobsForce(0, false, true, query);
  },

  reloadJobs() {
    if (JobsStore.loadJobsErrorCount() < 10) {
      return this.loadJobsForce(0, false, true).then(() => {
        return this.reloadNotFinishedJobs();
      });
    }
  },

  loadMoreJobs() {
    const offset = JobsStore.getNextOffset();
    return this.loadJobsForce(offset, false, false);
  },

  loadJobsForce(offset, forceResetJobs, preserveCurrentOffset, forceQuery) {
    const actions = this;
    const limit = JobsStore.getLimit();
    const query = forceQuery || JobsStore.getQuery();
    // always reset jobs if showing only first page
    const isFirstPageOnly = offset === 0 && JobsStore.getAll().count() <= limit;
    const resetJobs = forceResetJobs || (isFirstPageOnly && !forceQuery);
    dispatcher.handleViewAction({ type: constants.ActionTypes.JOBS_LOAD });
    return jobsApi
      .getJobsParametrized(query, limit, offset)
      .then(jobs => {
        let newOffset = offset;
        this.reloadSapiTablesTrigger(jobs);
        if (preserveCurrentOffset) {
          newOffset = JobsStore.getOffset();
        }
        return actions.recieveJobs(jobs, newOffset, resetJobs);
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.JOBS_LOAD_ERROR,
          exception: e
        });
        throw e;
      });
  },

  filterJobs(query) {
    return RoutesStore.getRouter().transitionTo('jobs', null, { q: query });
  },

  setQuery(query) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOBS_SET_QUERY,
      query
    });
  },

  loadJobDetail(jobId) {
    if (JobsStore.has(jobId)) {
      return Promise.resolve();
    }
    return this.loadJobDetailForce(jobId);
  },

  loadJobDetailForce(jobId) {
    const actions = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOB_LOAD,
      jobId
    });
    return jobsApi.getJobDetail(jobId).then(jobDetail => {
      this.reloadSapiTablesTrigger([jobDetail]);
      return actions.recieveJobDetail(jobDetail);
    });
  },

  recieveJobs(jobs, newOffset, resetJobs) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOBS_LOAD_SUCCESS,
      jobs,
      newOffset,
      resetJobs
    });
  },

  recieveJobDetail(jobDetail) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOB_LOAD_SUCCESS,
      job: jobDetail
    });
  },

  terminateJob(jobId) {
    const actions = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOB_TERMINATE_START,
      jobId
    });

    return jobsApi
      .terminateJob(jobId)
      .then(() => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.JOB_TERMINATE_SUCCESS,
          jobId
        });
        return actions.loadJobDetailForce(jobId);
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.JOB_TERMINATE_ERROR,
          jobId
        });
        throw e;
      });
  },

  loadComponentConfigurationLatestJobs(componentId, configurationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.JOBS_LATEST_LOAD_START,
      componentId,
      configurationId
    });

    const query = `(component:${componentId} OR params.component:${componentId}) AND params.config:${configurationId}`;
    return jobsApi
      .getJobsParametrized(query, 30, 0)
      .then(jobs => {
        this.reloadSapiTablesTrigger(jobs);
        dispatcher.handleViewAction({
          type: constants.ActionTypes.JOBS_LATEST_LOAD_SUCCESS,
          componentId,
          configurationId,
          jobs
        });
        return null;
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.JOBS_LATEST_LOAD_ERROR,
          componentId,
          configurationId,
          error: e
        });
        throw e;
      });
  }
};
