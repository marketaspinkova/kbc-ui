import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import {Modal, Tabs, Tab} from 'react-bootstrap';
import {RefreshIcon} from '@keboola/indigo-ui';
import EventsTab from './EventsTab';
import GeneralInfoTab from './GeneralInfoTab';
import DataSampleTab from './DataSampleTab';
import ColumnsInfoTab from './ColumnsInfoTab';
import TableDescriptionTab from './TableDescriptionTab';
import SapiTableLink from '../../../components/react/components/StorageApiTableLink';

export default createReactClass({
  propTypes: {
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
    return (
      <Modal.Dialog
        className="kbc-table-browser"
        bsSize="large"
        onKeyDown={this.onKeyDown}
      >
        <Modal.Header>
          <button 
            onClick={this.props.onHideFn}
            type="button" 
            className="close" 
            ref="close" 
            data-dismiss="modal"
          >&times;
          </button>
          <Modal.Title>
            {this.props.tableId}
            {this.props.tableExists ? (
              <SapiTableLink tableId={this.props.tableId}>
                <small className="btn btn-link">
                  Explore in Console
                </small>
              </SapiTableLink>
            ) : (
              <small className="disabled btn btn-link"> Explore in Console</small>
            )}
            <RefreshIcon
              isLoading={this.props.isLoading}
              onClick={this.props.reload}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderModalBody()}
        </Modal.Body>
      </Modal.Dialog>
    );
  },

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.props.onHideFn();
    }
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
        table={this.props.table}
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
