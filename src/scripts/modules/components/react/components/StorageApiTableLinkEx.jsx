import React from 'react';
import Immutable, {Map} from 'immutable';
import _ from 'underscore';
import Promise from 'bluebird';

import {Table, Modal, Button} from 'react-bootstrap';
import {TabbedArea, TabPane} from 'react-bootstrap';
import filesize from 'filesize';
import {RefreshIcon} from 'kbc-react-components';

import Tooltip from '../../../../react/common/Tooltip';
import SapiTableLink from './StorageApiTableLink';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import date from '../../../../utils/date';


import storageActions from '../../StorageActionCreators';
import storageApi from '../../StorageApi';

import tablesStore from '../../stores/StorageTablesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

import EventsService from '../../../sapi-events/EventService';

export default React.createClass({

  mixins: [createStoreMixin(tablesStore)],

  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    linkLabel: React.PropTypes.string
  },

  getStateFromStores(){
    const isLoading = tablesStore.getIsLoading();
    const tables = tablesStore.getAll() || Map();
    const table = tables.get(this.props.tableId, Map());

    return {
      table: table,
      isLoading: isLoading
    };
  },


  componentDidMount(){
    storageActions.loadTables();//.then(() => this.exportDataSample());
  },

  componentWilUnmount(){
    this.stopEventService();
  },

  /* shouldComponentUpdate(nextProps, nextState){
     return (nextState.show === true || this.state.show === true || nextState.isLoading === false) && nextState !== this.state;
     }, */


  getInitialState(){
    const es = EventsService.factory({limit: 10});
    let typesQuery = _.map(_.keys(this.eventsTemplates), (t) => 'event:' + t).join(' OR ');
    typesQuery = `(${typesQuery}) AND objectId:${this.props.tableId}`;
    es.setQuery(typesQuery);

    return ({
      eventService: es,
      events: Immutable.List(),
      show: false,
      dataPreview: Immutable.List(),
      loadingPreview: false
    });
  },

  render(){
    return (
      <span key="mainspan">
        <Tooltip key="tooltip"
          tooltip={this.renderTooltip()}
          placement="top">
          {this.renderLink()}
        </Tooltip>
        {this.state.show ? this.renderModal() : (<span></span>)}
      </span>
    );
  },

  renderLink(){
    return (
      <Button key="buttonlink"
        bsStyle="link"
        onClick={this.onShow}>
        {this.props.linkLabel || this.props.tableId}
      </Button>);

  },

  renderModalBody(){
    return (
      <TabbedArea key="tabbedarea" animation={false}>
        <TabPane key="general" eventKey="general" tab="General Info">
          {this.renderGeneralInfo()}
        </TabPane>
        <TabPane key="columns" eventKey="columns" tab="Columns">
          {this.renderColumnsInfo()}
        </TabPane>
        <TabPane key="datasample" eventKey="datasample" tab="Data Sample">
          {this.renderDataSample()}
        </TabPane>
        <TabPane key="events" eventKey="events" tab="Export/Import Events">
          {this.renderEvents()}
        </TabPane>
      </TabbedArea>
    );

  },

  renderEvents(){
    if (!this.tableExists()){
      return (
        <EmptyState>
        No Data.
       </EmptyState>
      );
    }
    //console.log(this.state.events.toJS(), this.state.events.count());
    const events = this.state.events;
    const rows = events.map( (e) => {
      const info = this.eventsTemplates[e.get('event')];
      const cl = `tr ${info.className}`;

      return (
        <tr className={cl}>
          <td className="td">
            {date.format(e.get('created'))}
          </td>
          <td className="td">
            {e.get('component')}
          </td>
          <td className="td">
            {info.message}
          </td>
          <td className="td">
            {e.getIn(['token', 'name'])}
          </td>
        </tr>
      );
    }
    );
    return (
      <table className="table table-striped">
        <thead className="thead">
          <tr className="tr">
            <th className="th">
              Created
            </th>
            <th className="th">
              Component
            </th>
            <th className="th">
              Event
            </th>
            <th className="th">
              Creator
            </th>

          </tr>
        </thead>
        <tbody className="tbody">
          {rows}
        </tbody>
      </table>);
  },

  renderDataSample(){
    const data = this.state.dataPreview;
    if (data.count() === 0){
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }

    const header = data.first().map( (c) => {
      return (
        <th>
          {c}
        </th>
      );
    }).toArray();
    const rows = data.rest().map( (row) => {
      const cols = row.map( (c) => {
        return (<td> {c} </td>);
      });

      return (
        <tr>
          {cols}
        </tr>);
    });

    return (
      <div>
        <Table responsive className="table table-stripped">
          <thead>
            <tr>
              {header}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  },

  renderColumnsInfo(){
    if (!this.tableExists() || !this.isDataPreview()){
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }
    const {table} = this.state;
    const columns = table.get('columns');
    const columnsRows = columns.map((c) => {
      const values = this.getColumnValues(c);
      let result = values.filter((val) => val !== '').join(' ,');
      return this.renderTableRow(c, result);
    });

    return (
      <div>
        <Table responsive className="table table-stripped">
          <thead>
            <tr>
              <th>
                Column
              </th>
              <th>
                Sample Values
              </th>
            </tr>
          </thead>
          <tbody>
            {columnsRows}
          </tbody>
        </Table>
      </div>
    );
  },

  renderGeneralInfo(){
    if (!this.tableExists())
    {
      let msg = 'Table does not exist yet.';
      if (this.state.isLoading){
        msg = 'Loading...';
      }
      return (
        <EmptyState key="emptytable">
          {msg}
        </EmptyState>
      );

    }
    const table = this.state.table;
    const primaryKey = table.get('primaryKey').toJS();
    const indexes = table.get('indexedColumns').toJS();
    return (
      <div>
        <table className="table table-stripped">
          <tbody>
            {this.renderTableRow('ID', table.get('id'))}
            {this.renderTableRow('Created', date.format(table.get('created')))}
            {this.renderTableRow('Primary Key', _.isEmpty(primaryKey) ? 'N/A' : primaryKey.join(','))}
            {this.renderTableRow('Last Import', date.format(table.get('lastImportDate')))}
            {this.renderTableRow('Last Change', date.format(table.get('lastChangeDate')))}

            {this.renderTableRow('Rows Count', table.get('rowsCount') + ' rows')}
            {this.renderTableRow('Data Size', filesize(table.get('dataSizeBytes')))}
            {this.renderTableRow('Columns Count', table.get('columns').count() + ' columns')}

            {this.renderTableRow('Indexed Column(s)', _.isEmpty(indexes) ? 'N/A' : indexes.join(' ,'))}
          </tbody>
        </table>
      </div>
    );
  },

  renderTableRow(name, value){
    return (
      <tr>
        <td>
          {name}
        </td>
        <td>
          {value}
        </td>
      </tr>
    );

  },

  renderModal(){
    const modalBody = this.renderModalBody();
    return (
      <div className="static-modal">
        <Modal
          bsSize="large"
          show={this.state.show}
          onHide={this.onHide}
          >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.tableId}
              <SapiTableLink
                 disabled={true}
                 tableId={this.props.tableId}>
                <small className="btn btn-link">
                  Explore in Console
                </small>
              </SapiTableLink>
              <RefreshIcon
                 isLoading={this.isLoading()}
                 onClick={this.reload}
              />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalBody}
          </Modal.Body>
        </Modal>
      </div>
    );
  },

  isLoading(){
    return this.state.isLoading || this.state.loadingPreview || this.state.eventService.getIsLoading();

  },

  renderTooltip(){
    if (this.state.isLoading){
      return 'Loading';
    }

    const table = this.state.table;
    if (!this.tableExists()){
      return 'Table does not exist yet.';
    }

    return (
      <span key="tooltipinfo">
        <div>
          {date.format(table.get('lastChangeDate'))}
        </div>
        <div>
          {filesize(table.get('dataSizeBytes'))}
        </div>
        <div>
          {table.get('rowsCount')} rows
        </div>
      </span>
    );
  },

  onHide(){
    this.setState({show: false});
    this.stopEventService();
  },

  reload(){
    Promise.props( {
      'loadAllTablesFore': storageActions.loadTablesForce(),
      'exportData': this.exportDataSample(),
      'loadEvents': this.state.eventService.load()
    });
  },

  onShow(){
    this.exportDataSample();
    this.startEventService();
    this.setState({show: true});
  },


  getColumnValues(columnName){
    const data = this.state.dataPreview;
    const columnIndex = data.first().indexOf(columnName);

    const result = data
    .shift()
    .map( (row) => {
      return row.get(columnIndex);
    });
    return result;
  },

  startEventService(){
    this.state.eventService.addChangeListener(this.handleEventsChange);
    this.state.eventService.load();
  },

  stopEventService(){
    this.state.eventService.stopAutoReload();
    this.state.eventService.removeChangeListener(this.handleEventsChange);
  },

  handleEventsChange(){
    const events = this.state.eventService.getEvents();
    this.setState({events: events});
  },

  exportDataSample(){
    if (!this.tableExists())
    {
      return false;
    }

    this.setState({
      loadingPreview: true
    });
    const component = this;
    return storageApi
    .exportTable(this.props.tableId, {limit: 10})
    .then( (csv) => {
      component.setState({
        loadingPreview: false,
        dataPreview: Immutable.fromJS(csv)
      });
    });

  },

  tableExists(){
    return !_.isEmpty(this.state.table.toJS());
  },

  isDataPreview(){
    return !_.isEmpty(this.state.dataPreview.toJS());
  },

  eventsTemplates: {
    'storage.tableImportStarted': {
      'message': 'Import started',
      'className': ''
    },

    'storage.tableImportDone': {
      'message': 'Successfully imported ',
      'className': 'success'
    },

    'storage.tableImportError': {
      'message': 'Error on table import',
      'className': 'error'
    },

    'storage.tableExported': {
      'message': 'Exported to a csv file',
      'className': 'info'
    }

  }


});
