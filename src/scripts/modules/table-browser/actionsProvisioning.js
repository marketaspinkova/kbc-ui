import storeProvisioning from './storeProvisioning';
import tableBrowserActions from './flux/actions';
// import storageActions from '../components/StorageActionCreators';
import storageApi from '../components/StorageApi';
import {startDataProfilerJob, getDataProfilerJob, fetchProfilerData} from './react/components/EnhancedAnalysis/DataProfilerUtils';
import {fromJS, List, Map} from 'immutable';
import { factory as EventsServiceFactory} from '../sapi-events/EventsService';
import later from 'later';
import _ from 'underscore';

const  IMPORT_EXPORT_EVENTS = ['tableImportStarted', 'tableImportDone', 'tableImportError', 'tableExported'];

function runExportDataSample(tableId, onSucceed, onFail) {
  return storageApi
    .tableDataJsonPreview(tableId, {limit: 10})
    .then(onSucceed)
    .catch((error) => {
      let dataPreviewError = null;
      if (error.response && error.response.body) {
        if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
          dataPreviewError = 'Data sample cannot be displayed. Too many columns.';
        } else {
          dataPreviewError = error.response.body.message;
        }
      } else {
        throw new Error(JSON.stringify(error));
      }
      return onFail(dataPreviewError);
    });
}

export default function(tableId) {
  const getStore = () => storeProvisioning(tableId);
  const getLocalState = (path) => getStore().getLocalState(path);
  const getEventService = () => getStore().eventService;
  const setLocalStateByPath = (path, value) => {
    const newLocalState = getLocalState().setIn([].concat(path), value);
    return tableBrowserActions.setLocalState(tableId, newLocalState);
  };
  const setLocalState = (newStateObject) => {
    const keysToUpdate = Object.keys(newStateObject);
    const newLocalState = keysToUpdate.reduce(
      (memo, key) => memo.set(key, newStateObject[key]),
      getLocalState()
    );
    tableBrowserActions.setLocalState(tableId, newLocalState);
  };

  const exportDataSample = () => {
    const onSucceed = (json) =>
      setLocalState({
        loadingPreview: false,
        dataPreview: json
      });

    const onFail = (dataPreviewError) => setLocalState({
      loadingPreview: false,
      dataPreviewError: dataPreviewError
    });

    setLocalState({
      loadingPreview: true
    });
    return runExportDataSample(tableId, onSucceed, onFail);
  };

  // ----START-- redhift tables enhanced lg analysis functions-------
  const findEnhancedJob = () => {
    // do the enhanced analysis only for redshift tables
    if (!getStore().isRedshift()) {
      return;
    }
    setLocalState({loadingProfilerData: true});
    fetchProfilerData(tableId).then( (result) =>{
      setLocalState({
        profilerData: fromJS(result),
        loadingProfilerData: false
      });
      if (result && result.runningJob) {
        pollDataProfilerJob();
      }
    });
  };

  const stopPollingDataProfilerJob = () => {
    if (getLocalState('timeout')) {
      getLocalState('timeout').clear();
    }
  };

  const getDataProfilerJobResult = () => {
    const jobId = getLocalState(['profilerData', 'runningJob', 'id']);
    getDataProfilerJob(jobId).then( (runningJob) => {
      if (runningJob.isFinished) {
        stopPollingDataProfilerJob();
        findEnhancedJob();
      }
    });
  };

  const pollDataProfilerJob = () => {
    const schedule = later.parse.recur().every(5).second();
    stopPollingDataProfilerJob();
    const timeout = later.setInterval(getDataProfilerJobResult, schedule);
    setLocalState('timeout', timeout);
  };

  const onRunEnhancedAnalysis = () => {
    setLocalState({isCallingRunAnalysis: true});
    startDataProfilerJob(tableId)
      .then( () => {
        findEnhancedJob().then(() => setLocalState({isCallingRunAnalysis: false}));
      })
      .catch(() => setLocalState({isCallingRunAnalysis: false}));
  };
  // ----END-- redhift tables enhanced lg analysis functions-------

  // Events service provisioning
  const handleEventsChange = () => {
    const events = getEventService().getEvents();
    setLocalState({events: events});
  };

  const startEventService = () => {
    getEventService().addChangeListener(handleEventsChange);
    getEventService().load();
  };

  const stopEventService = () => {
    getEventService().stopAutoReload();
    getEventService().removeChangeListener(handleEventsChange);
  };

  const createEventQueryString = (options) => {
    const {omitExports, omitFetches, filterIOEvents} = options;
    const omitFetchesEvent = omitFetches ? ['tableDataPreview', 'tableDetail'] : [];
    const omitExportsEvent = omitExports ? ['tableExported'] : [];
    let omitsQuery = omitFetchesEvent.concat(omitExportsEvent).map((ev) => `NOT event:storage.${ev}`);
    if (filterIOEvents) {
      omitsQuery =  IMPORT_EXPORT_EVENTS.map((ev) => `event:storage.${ev}`);
    }
    const objectIdQuery = `objectId:${tableId}`;
    return _.isEmpty(omitsQuery) ? objectIdQuery : `((${omitsQuery.join(' OR ')}) AND ${objectIdQuery})`;
  };

  const prepareEventQuery = () => {
    const options = {
      omitExports: getLocalState('omitExports'),
      omitFetches: getLocalState('omitFetches'),
      filterIOEvents: getLocalState('filterIOEvents')
    };
    return createEventQueryString(options);
  };

  const setEventsFilter = (filterName) => {
    return (e) => {
      setLocalStateByPath(filterName, e.target.checked);
      const q = prepareEventQuery();
      getEventService().setQuery(q);
      getEventService().load();
    };
  };

  const resetTableEvents = () => {
    const q = prepareEventQuery();
    stopEventService();
    getLocalState('eventService').reset();
    getLocalState('eventService').setQuery(q);
  };

  return {
    setLocalState: setLocalState,
    startEventService: startEventService,
    stopEventService: stopEventService,
    resetTableEvents: resetTableEvents,

    exportDataSample: exportDataSample,

    stopPollingDataProfilerJob: stopPollingDataProfilerJob,
    findEnhancedJob: findEnhancedJob,
    onRunEnhancedAnalysis: onRunEnhancedAnalysis,
    setEventsFilter: setEventsFilter,

    loadAll: () => {
      exportDataSample();
      startEventService();
      findEnhancedJob();
    },

    initLocalState: () => {
      const es = EventsServiceFactory({limit: 10});
      const eventOptions = {omitFetches: true, omitExports: false, filterIOEvents: false};
      const eventQuery = createEventQueryString(eventOptions);
      es.setQuery(eventQuery);
      return Map({
        eventService: es,
        events: List(),
        dataPreview: null,
        dataPreviewError: null,
        loadingPreview: false,
        loadingProfilerData: false,
        omitFetches: eventOptions.omitFetches,
        omitExports: eventOptions.omitExports,
        filterIOEvents: eventOptions.filterIOEvents,
        isCallingRunAnalysis: false,
        detailEventId: null,
        profilerData: Map()
      });
    }
  };
}