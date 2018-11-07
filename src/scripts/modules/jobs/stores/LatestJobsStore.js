import { Map, List, fromJS, Record } from 'immutable';
import StoreUtils from '../../../utils/StoreUtils';
import * as constants from '../Constants';
import Dispatcher from '../../../Dispatcher';

const JobsRecord = Record({
  isLoaded: false,
  isLoading: true,
  jobs: List()
});

let _store = Map();

const JobsStore = StoreUtils.createStore({
  getJobs(componentId, configurationId) {
    return _store.getIn([componentId, configurationId], new JobsRecord());
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
