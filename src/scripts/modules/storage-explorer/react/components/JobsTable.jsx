import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';
import { Table } from 'react-bootstrap';
import DurationStatic from '../../../../react/common/DurationStatic';
import FileSize from '../../../../react/common/FileSize';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import date from '../../../../utils/date';
import tableIdParser from '../../../../utils/tableIdParser';
import JobDetailModal from '../modals/JobDetailModal';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    jobs: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showJobModal: false,
      jobDetail: null
    };
  },

  render() {
    if (!this.props.jobs.count()) {
      return null;
    }

    return (
      <div>
        {this.renderJobDetailModal()}

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Operation</th>
              <th>Table ID</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Data Transfer</th>
              <th>Created time</th>
              <th>Creator</th>
            </tr>
          </thead>
          <tbody>{this.props.jobs.map(this.renderRow).toArray()}</tbody>
        </Table>
      </div>
    );
  },

  renderRow(job) {
    return (
      <tr key={job.get('id')} onClick={() => this.openJobDetail(job)} className="kbc-cursor-pointer">
        <td>{job.get('id')}</td>
        <td>{job.get('operationName')}</td>
        <td>{this.tableLink(job)}</td>
        <td>
          <JobStatusLabel status={job.get('status')} />
        </td>
        <td>
          {(job.get('status') === 'success' || job.get('status') === 'error') && (
            <DurationStatic startTime={job.get('startTime')} endTime={job.get('endTime')} />
          )}
        </td>
        <td>
          <FileSize size={this.jobDataTransfer(job)} />
        </td>
        <td>{date.format(job.get('createdTime'))}</td>
        <td>{job.getIn(['creatorToken', 'description'])}</td>
      </tr>
    );
  },

  renderJobDetailModal() {
    if (!this.state.jobDetail) {
      return null;
    }

    return (
      <JobDetailModal
        show={this.state.showJobModal}
        job={this.state.jobDetail}
        onHide={this.resetJob}
        tableLinkFn={this.tableLink}
        dataTransferFn={this.jobDataTransfer}
      />
    );
  },

  tableLink(job) {
    const tableCreate = job.get('operationName') === 'tableCreate';
    const tableId = tableCreate ? job.getIn(['results', 'id'], job.get('tableId')) : job.get('tableId');
    const { stage, bucket, table } = tableIdParser.parse(tableId).parts;

    return (
      <Link
        to="storage-explorer-table"
        params={{
          bucketId: `${stage}.${bucket}`,
          tableName: table
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {tableId}
      </Link>
    );
  },

  jobDataTransfer(job) {
    const metric = job.get('metrics');
    const inData = metric.get('inCompressed', false) ? metric.get('inBytes') : metric.get('inBytesUncompressed');
    const outData = metric.get('outCompressed', false) ? metric.get('outBytes') : metric.get('outBytesUncompressed');
    return inData + outData;
  },

  openJobDetail(job) {
    this.setState({
      showJobModal: true,
      jobDetail: job
    });
  },

  resetJob() {
    this.setState({
      showJobModal: false
    });
  }
});
