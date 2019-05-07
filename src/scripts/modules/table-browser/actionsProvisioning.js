import _ from 'underscore';
import { List, Map } from 'immutable';
import storageApi from '../components/StorageApi';
import { factory as EventsServiceFactory} from '../sapi-events/EventsService';
import storeProvisioning from './storeProvisioning';
import tableBrowserActions from './flux/actions';

const IMPORT_EXPORT_EVENTS = ['tableImportStarted', 'tableImportDone', 'tableImportError', 'tableExported'];

function runExportDataSample(tableId, onSucceed, onFail) {
  return storageApi
    .tableDataJsonPreview(tableId, {limit: 10})
    .then(onSucceed)
    .catch((error) => {
      if (error.response && error.response.body) {
        if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
          return onFail('Data sample cannot be displayed. Too many columns.');
        }

        return onFail(error.response.body.message);
      }
      
      throw error;
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
    setEventsFilter: setEventsFilter,
    loadAll: () => {
      exportDataSample();
      startEventService();
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
        omitFetches: eventOptions.omitFetches,
        omitExports: eventOptions.omitExports,
        filterIOEvents: eventOptions.filterIOEvents,
        detailEventId: null
      });
    }
  };
}
