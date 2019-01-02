import React, {PropTypes} from 'react';
import TablesPaginator from './TablesPaginator';
import EventsTab from './EventsTab';
import GeneralInfoTab from './GeneralInfoTab';
import DataSampleTab from './DataSampleTab';
import ColumnsInfoTab from './ColumnsInfoTab';
import TableDescriptionTab from './TableDescriptionTab';

import SapiTableLink from '../StorageApiTableLink';
import immutableMixin from 'react-immutable-render-mixin';

import {Modal, Tabs, Tab} from 'react-bootstrap';
import {RefreshIcon} from '@keboola/indigo-ui';


export default React.createClass({

  propTypes: {
    moreTables: React.PropTypes.object,
    show: PropTypes.bool.isRequired,
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
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
        onKeyDown={this.onKeyDown}
      >
        <Modal.Header closeButton>
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
      </Modal>
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
    return e;
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
      <div style={{maxHeight: '75vh'}} className="pre-scrollable">
        <Tabs defaultActiveKey="general" animation={false} id={'modal' + this.props.tableId}>
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
