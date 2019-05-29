import { Map, List, fromJS, Record } from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import * as constants from '../Constants';
import Dispatcher from '../../../Dispatcher';

const JobsRecord = Record({
  isLoaded: false,
  isLoading: true,
  jobs: List()
});

let _store = initStore('LatestJobsStore', Map());

const JobsStore = StoreUtils.createStore({
  getJobs(componentId, configurationId) {
    return _store.getIn([componentId, configurationId], new JobsRecord());
  },

  getRowJobs(componentId, configurationId, rowId) {
    const configJobs = _store.getIn([componentId, configurationId], new JobsRecord());
    return configJobs.update('jobs', function(jobs) {
      return jobs.filter(function(job) {
        if (!job.hasIn(['params', 'row'])) {
          return true;
        }
        if (job.getIn(['params', 'row']) === rowId) {
          return true;
        }
        return false;
      });
    });
  },

  getTransformationJobs(configurationId, rowId) {
    const configJobs = _store.getIn(['transformation', configurationId], new JobsRecord());
    return configJobs.update('jobs', function(jobs) {
      return jobs.filter(function(job) {
        if (job.getIn(['params', 'transformations'], List()).count() === 0) {
          return true;
        }
        if (job.getIn(['params', 'transformations', 0]) === rowId) {
          return true;
        }
        return false;
      });
    });
  }
});

Dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.JOBS_LATEST_LOAD_START:
      _store = _store.updateIn([action.componentId, action.configurationId], new JobsRecord(), jobs =>
        jobs.set('isLoading', true)
      );
      return JobsStore.emitChange();

    case constants.ActionTypes.JOBS_LATEST_LOAD_ERROR:
      _store = _store.setIn([action.componentId, action.configurationId, 'isLoading'], false);
      return JobsStore.emitChange();

    case constants.ActionTypes.JOBS_LATEST_LOAD_SUCCESS:
      _store = _store.withMutations(store =>
        store.setIn(
          [action.componentId, action.configurationId],
          Map({
            isLoading: false,
            isLoaded: true,
            jobs: fromJS(action.jobs)
          })
        )
      );
      return JobsStore.emitChange();

    default:
      break;
  }
});

export default JobsStore;
