import PropTypes from 'prop-types';
import React from 'react';
import TablesPaginator from './TablesPaginator';
import EventsTab from './EventsTab';
import GeneralInfoTab from './GeneralInfoTab';
import DataSampleTab from './DataSampleTab';
import ColumnsInfoTab from './ColumnsInfoTab';
import TableDescriptionTab from './TableDescriptionTab';

import SapiTableLink from '../../../components/react/components/StorageApiTableLink';
import immutableMixin from 'react-immutable-render-mixin';

import {Modal, Tabs, Tab} from 'react-bootstrap';
import {RefreshIcon} from '@keboola/indigo-ui';


export default React.createClass({

  propTypes: {
    moreTables: PropTypes.array,
    tableId: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
    tableExists: PropTypes.bool.isRequired,
    omitFetches: PropTypes.bool,
    events: PropTypes.object.isRequired,
    omitExports: PropTypes.bool,
    isLoading: PropTypes.bool,
    table: PropTypes.object,
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string,
    onOmitFetchesFn: PropTypes.func,
    onOmitExportsFn: PropTypes.func,
    onHideFn: PropTypes.func,
    onChangeTable: PropTypes.func,
    filterIOEvents: PropTypes.bool,
    onFilterIOEvents: PropTypes.func,
    onShowEventDetail: PropTypes.func,
    detailEventId: PropTypes.number
  },

  mixins: [immutableMixin],

  componentDidMount() {
    this.refs.close.focus();
  },

  render() {
    const modalBody = this.renderModalBody();
    let tableLink = (<small className="disabled btn btn-link"> Explore in Console</small>);
    if (this.props.tableExists) {
      tableLink =
        (
          <SapiTableLink
            tableId={this.props.tableId}>
            <small className="btn btn-link">
              Explore in Console
            </small>
          </SapiTableLink>);
    }
    return (
      <Modal.Dialog
        className="kbc-table-browser"
        bsSize="large"
        onKeyDown={this.onKeyDown}
      >
        <Modal.Header>
          <button onClick={this.props.onHideFn}
            type="button" className="close" ref="close" data-dismiss="modal">&times;</button>
          <Modal.Title>
            {this.props.tableId}
            {tableLink}
            <RefreshIcon
              isLoading={this.props.isLoading}
              onClick={this.props.reload}
            />
          </Modal.Title>
          {/* this.renderPaginator() */}
        </Modal.Header>
        <Modal.Body>
          {modalBody}
        </Modal.Body>
      </Modal.Dialog>
    );
  },

  renderPaginator() {
    if (this.props.moreTables.length - 1 > 0) {
      return (
        <TablesPaginator
          nextTable={this.getNextTable()}
          previousTable={this.getPreviousTable()}
          onChangeTable={this.props.onChangeTable} />
      );
    }
  },

  getNextTable() {
    const tables = this.props.moreTables;
    const position = tables.indexOf(this.props.tableId);
    return position + 1 < tables.length ? tables[position + 1] : null;
  },

  getPreviousTable() {
    const tables = this.props.moreTables;
    const position = tables.indexOf(this.props.tableId);
    return position - 1 >= 0 ? tables[position - 1] : null;
  },

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.props.onHideFn();
    }
    /* const arrowRight = e.key === 'ArrowRight';
     * const arrowLeft = e.key === 'ArrowLeft';
     * if (arrowRight && this.getNextTable()) {
     *   return this.props.onChangeTable(this.getNextTable());
     * }
     * if (arrowLeft && this.getPreviousTable()) {
     *   return this.props.onChangeTable(this.getPreviousTable());
     * }*/
  },

  renderModalBody() {
    return (
      <div>
        <Tabs className="tabs-inside-modal" defaultActiveKey="general" animation={false} id={'modal' + this.props.tableId}>
          <Tab eventKey="general" title="General Info">
            {this.renderGeneralInfo()}
          </Tab>
          <Tab eventKey="description" title="Description">
            {this.renderTableDescription()}
          </Tab>
          <Tab eventKey="columns" title="Columns">
            {this.renderColumnsInfo()}
          </Tab>
          <Tab eventKey="datasample" title="Data Sample">
            {this.renderDataSample()}
          </Tab>
          <Tab eventKey="events" title="Events">
            {this.renderEvents()}
          </Tab>
        </Tabs>
      </div>
    );
  },

  renderGeneralInfo() {
    return (
      <GeneralInfoTab
        isLoading={this.props.isLoading}
        table={this.props.table}
        tableExists={this.props.tableExists}
      />
    );
  },

  renderTableDescription() {
    return (
      <TableDescriptionTab
        isLoading={this.props.isLoading}
        tableId={this.props.tableId}
        tableExists={this.props.tableExists}
      />
    );
  },

  renderEvents() {
    return (
      <EventsTab
        tableExists={this.props.tableExists}
        tableId={this.props.tableId}
        events={this.props.events}
        omitFetches={this.props.omitFetches}
        omitExports={this.props.omitExports}
        onOmitFetchesFn={this.props.onOmitFetchesFn}
        onOmitExportsFn={this.props.onOmitExportsFn}
        filterIOEvents={this.props.filterIOEvents}
        onFilterIOEvents={this.props.onFilterIOEvents}
        onShowEventDetail={this.props.onShowEventDetail}
        detailEventId={this.props.detailEventId}

      />

    );
  },

  renderDataSample() {
    return (
      <DataSampleTab
        dataPreview={this.props.dataPreview}
        dataPreviewError={this.props.dataPreviewError}
      />
    );
  },

  renderColumnsInfo() {
    return (
      <ColumnsInfoTab
        tableExists={this.props.tableExists}
        table={this.props.table}
        dataPreview={this.props.dataPreview}
        dataPreviewError={this.props.dataPreviewError}
      />
    );
  }

});
