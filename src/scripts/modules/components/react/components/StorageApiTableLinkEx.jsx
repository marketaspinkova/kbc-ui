import React from 'react';
import Immutable, {List, Map} from 'immutable';
import _ from 'underscore';
import Promise from 'bluebird';
import moment from 'moment';
import filesize from 'filesize';
import later from 'later';

import storageActions from '../../StorageActionCreators';
import storageApi from '../../StorageApi';
import tablesStore from '../../stores/StorageTablesStore';

import TableLinkModalDialog from './StorageApiTableLinkExComponents/ModalDialog';
import {startDataProfilerJob, getDataProfilerJob, fetchProfilerData} from './StorageApiTableLinkExComponents/DataProfilerUtils';

import Tooltip from '../../../../react/common/Tooltip';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import {factory as eventsFactory} from '../../../sapi-events/EventsService';
import RoutesStore from '../../../../stores/RoutesStore';
import hiddenComponents from '../../utils/hiddenComponents';
import formatCardinalNumber from '../../../../utils/formatCardinalNumber';
import {NotAvailable} from '@keboola/indigo-ui';


const  IMPORT_EXPORT_EVENTS = ['tableImportStarted', 'tableImportDone', 'tableImportError', 'tableExported'];

export default React.createClass({

  mixins: [createStoreMixin(tablesStore)],

  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    linkLabel: React.PropTypes.string,
    moreTables: React.PropTypes.object,
    children: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      moreTables: List()
    };
  },

  getStateFromStores() {
    return this.prepareStateFromProps({tableId: this.getTableId()});
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.prepareStateFromProps(nextProps));
  },

  prepareStateFromProps(props) {
    const isLoading = tablesStore.getIsLoading();
    const tables = tablesStore.getAll() || Map();
    const table = tables.get(props.tableId, Map());
    return {
      tableId: props.tableId,
      table: table,
      isLoading: isLoading
    };
  },

  changeTable(newTableId, dontLoadAll) {
    let newState = _.clone(this.prepareStateFromProps({tableId: newTableId}));
    const initDataState = {
      detailEventId: null,
      isCallingRunAnalysis: false,
      profilerData: Map(),
      loadingPreview: false,
      loadingProfilerData: false,
      dataPreview: Immutable.List(),
      dataPreviewError: null,
      events: Immutable.List()
    };
    newState = _.extend(newState, initDataState);
    this.setState(newState, () => {
      if (!dontLoadAll) {
        this.resetTableEvents();
        this.loadAll();
      }
    });
  },

  getTableId() {
    return this.state ? this.state.tableId : this.props.tableId;
  },

  getInitialState() {
    const omitFetches = true, omitExports = false, filterIOEvents = false;
    const es = eventsFactory({limit: 10});
    const eventQuery = this.prepareEventQuery({omitFetches, omitExports, filterIOEvents});
    es.setQuery(eventQuery);

    return ({
      eventService: es,
      events: Immutable.List(),
      show: false,
      dataPreview: Immutable.List(),
      dataPreviewError: null,
      loadingPreview: false,
      loadingProfilerData: false,
      omitFetches: omitFetches,
      omitExports: omitExports,
      filterIOEvents: filterIOEvents,
      isCallingRunAnalysis: false,
      detailEventId: null,
      profilerData: Map()
    });
  },

  componentDidMount() {
    setTimeout(() => storageActions.loadTables());
  },

  componentWilUnmount() {
    this.stopEventService();
    this.stopPollingDataProfilerJob();
  },

  pollDataProfilerJob() {
    const schedule = later.parse.recur().every(5).second();
    this.stopPollingDataProfilerJob();
    this.timeout = later.setInterval(this.getDataProfilerJobResult, schedule);
  },

  getDataProfilerJobResult() {
    const jobId = this.state.profilerData.getIn(['runningJob', 'id']);
    getDataProfilerJob(jobId).then( (runningJob) => {
      if (runningJob.isFinished) {
        this.stopPollingDataProfilerJob();
        this.findEnhancedJob();
      }
    });
  },

  stopPollingDataProfilerJob() {
    if (this.timeout) {
      this.timeout.clear();
    }
  },

  findEnhancedJob() {
    // do the enhanced analysis only for redshift tables
    if (!this.isRedshift()) {
      return;
    }
    this.setState({loadingProfilerData: true});
    const tableId = this.getTableId();
    const component = this;
    fetchProfilerData(tableId).then( (result) =>{
      component.setState({
        profilerData: Immutable.fromJS(result),
        loadingProfilerData: false
      });
      if (result && result.runningJob) {
        this.pollDataProfilerJob();
      }
    });
  },

  render() {
    return (
      <span key="mainspan">
        {this.renderLink()}
        {this.state.show ? this.renderModal() : <span />}
      </span>
    );
  },

  renderLink() {
    return (
      <Tooltip key="tooltip"
        tooltip={this.renderTooltip()}
        placement="top">
        <span key="buttonlink" className="kbc-sapi-table-link"
          onClick={this.onShow}>
          {this.props.children || this.props.linkLabel || this.props.tableId}
        </span>
      </Tooltip>
    );
  },

  renderTooltip() {
    if (this.state.isLoading) {
      return 'Loading';
    }

    const table = this.state.table;
    if (!this.tableExists()) {
      return 'Table does not exist.';
    }
    if (table.get('lastChangeDate') === null) {
      return 'Table exists, but was never imported.';
    }
    return (
      <span key="tooltipinfo">
        <div>
          {moment(table.get('lastChangeDate')).fromNow()}
        </div>
        <div>
          {filesize(table.get('dataSizeBytes', <NotAvailable/>))}
        </div>
        <div>
          {formatCardinalNumber(table.get('rowsCount'))} rows
        </div>
      </span>
    );
  },

  renderModal() {
    return (
      <TableLinkModalDialog
        moreTables={this.props.moreTables.toArray()}
        show={this.state.show}
        tableId={this.getTableId()}
        reload={this.reload}
        tableExists={this.tableExists()}
        omitFetches={this.state.omitFetches}
        omitExports={this.state.omitExports}
        onHideFn={this.onHide}
        isLoading={this.isLoading()}
        table={this.state.table}
        dataPreview={this.state.dataPreview}
        dataPreviewError={this.state.dataPreviewError}
        onOmitExportsFn={this.onOmitExports}
        onOmitFetchesFn={this.onOmitFetches}
        events={this.state.events}
        enhancedAnalysis={this.state.profilerData}
        onRunAnalysis={this.onRunEnhancedAnalysis}
        isCallingRunAnalysis={this.state.isCallingRunAnalysis}
        loadingProfilerData={this.state.loadingProfilerData}
        isRedshift={this.isRedshift()}
        onChangeTable={this.changeTable}
        filterIOEvents={this.state.filterIOEvents}
        onFilterIOEvents={this.onFilterIOEvents}
        onShowEventDetail={(eventId) => this.setState({detailEventId: eventId})}
        detailEventId={this.state.detailEventId}
      />
    );
  },

  onRunEnhancedAnalysis() {
    this.setState({isCallingRunAnalysis: true});
    startDataProfilerJob(this.getTableId())
      .then( () => {
        this.findEnhancedJob().then(() => this.setState({isCallingRunAnalysis: false}));
      })
      .catch(() => this.setState({isCallingRunAnalysis: false}));
  },

  onOmitExports(e) {
    const checked = e.target.checked;
    this.setState({omitExports: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  onOmitFetches(e) {
    const checked = e.target.checked;
    this.setState({omitFetches: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  onFilterIOEvents(e) {
    const checked = e.target.checked;
    this.setState({filterIOEvents: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  resetTableEvents() {
    const q = this.prepareEventQuery();
    this.stopEventService();
    this.state.eventService.reset();
    this.state.eventService.setQuery(q);
  },

  prepareEventQuery(initState) {
    const state = initState || this.state;
    const {omitExports, omitFetches, filterIOEvents} = state;
    const omitFetchesEvent = omitFetches ? ['tableDataPreview', 'tableDetail'] : [];
    const omitExportsEvent = omitExports ? ['tableExported'] : [];
    let omitsQuery = omitFetchesEvent.concat(omitExportsEvent).map((ev) => `NOT event:storage.${ev}`);
    if (filterIOEvents) {
      omitsQuery =  IMPORT_EXPORT_EVENTS.map((ev) => `event:storage.${ev}`);
    }
    const objectIdQuery = `objectId:${this.getTableId()}`;
    return _.isEmpty(omitsQuery) ? objectIdQuery : `((${omitsQuery.join(' OR ')}) AND ${objectIdQuery})`;
  },

  isLoading() {
    return this.state.isLoading || this.state.loadingPreview || this.state.eventService.getIsLoading();
  },

  onHide() {
    this.setState({show: false});
    this.changeTable(this.props.tableId, true);
    this.stopPollingDataProfilerJob();
    this.stopEventService();
  },

  reload() {
    Promise.props( {
      'loadAllTablesFore': storageActions.loadTablesForce().then(() => this.findEnhancedJob()),
      'exportData': this.exportDataSample(),
      'loadEvents': this.state.eventService.load()
    });
  },

  loadAll() {
    if (hiddenComponents.hasCurrentUserDevelPreview()) return this.redirectToTablePage();
    this.exportDataSample();
    this.startEventService();
    this.findEnhancedJob();
    this.setState({show: true});
  },

  redirectToTablePage() {
    const path = RoutesStore.getRouterState().get('pathname');
    const tablePagePath = `${path}/tables/${this.props.tableId}`;
    const router = RoutesStore.getRouter();
    this.setState({show: false});
    router.transitionTo(tablePagePath);
  },

  onShow(e) {
    if (this.state.isLoading) {
      storageApi.getTables().then(() => this.loadAll());
    } else {
      this.loadAll();
    }
    e.stopPropagation();
    e.preventDefault();
  },

  startEventService() {
    this.state.eventService.addChangeListener(this.handleEventsChange);
    this.state.eventService.load();
  },

  stopEventService() {
    this.state.eventService.stopAutoReload();
    this.state.eventService.removeChangeListener(this.handleEventsChange);
  },

  handleEventsChange() {
    const events = this.state.eventService.getEvents();
    this.setState({events: events});
  },

  exportDataSample() {
    if (!this.tableExists()) {
      return false;
    }

    this.setState({
      loadingPreview: true
    });
    const component = this;
    return storageApi
      .tableDataPreview(this.getTableId(), {limit: 10})
      .then( (csv) => {
        component.setState({
          loadingPreview: false,
          dataPreview: Immutable.fromJS(csv)
        });
      })
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
        component.setState({
          loadingPreview: false,
          dataPreviewError: dataPreviewError
        });
      });
  },

  tableExists() {
    return !_.isEmpty(this.state.table.toJS());
  },

  isRedshift() {
    return this.tableExists() && this.state.table.getIn(['bucket', 'backend']) === 'redshift';
  }

});
