import React, { PropTypes } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { Tree } from '@keboola/indigo-ui';
import DurationStatic from '../../../../react/common/DurationStatic';
import FileSize from '../../../../react/common/FileSize';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import { format } from '../../../../utils/date';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    job: PropTypes.object.isRequired,
    tableLinkFn: PropTypes.func.isRequired,
    dataTransferFn: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Job {this.props.job.get('id')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderDetail()}
          {this.renderTreeData('Params', 'operationParams')}
          {this.renderTreeData('Results', 'results')}
          {this.renderTreeData('Error', 'error')}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="link" onClick={this.props.onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderDetail() {
    return (
      <Table responsive striped>
        <tbody>
          <tr>
            <td>Created time</td>
            <td>{format(this.props.job.get('createdTime'))}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>
              <JobStatusLabel status={this.props.job.get('status')} />
            </td>
          </tr>
          <tr>
            <td>Start time</td>
            <td>{this.props.job.get('startTime') ? format(this.props.job.get('startTime')) : 'N/A'}</td>
          </tr>
          <tr>
            <td>End time</td>
            <td>{this.props.job.get('endTime') ? format(this.props.job.get('endTime')) : 'N/A'}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>
              {(this.props.job.get('status') === 'success' || this.props.job.get('status') === 'error') && (
                <DurationStatic startTime={this.props.job.get('startTime')} endTime={this.props.job.get('endTime')} />
              )}
            </td>
          </tr>
          <tr>
            <td>Data Transfer</td>
            <td>
              <FileSize size={this.props.dataTransferFn(this.props.job)} />
            </td>
          </tr>
          <tr>
            <td>Operation</td>
            <td>{this.props.job.get('operationName')}</td>
          </tr>
          <tr>
            <td>Table ID</td>
            <td>{this.props.tableLinkFn(this.props.job)}</td>
          </tr>
          <tr>
            <td>Run ID</td>
            <td>{this.props.job.get('runIn', 'N/A')}</td>
          </tr>
          <tr>
            <td>File ID</td>
            <td>{this.fileId()}</td>
          </tr>
        </tbody>
      </Table>
    );
  },

  renderTreeData(header, param) {
    const data = this.props.job.get(param);

    if (!data || !data.count()) {
      return null;
    }

    return (
      <div>
        <h3>{header}</h3>
        <Tree data={data} />
      </div>
    );
  },

  fileId() {
    return this.props.job.getIn(
      ['results', 'file', 'id'],
      this.props.job.getIn(['operationParams', 'source', 'fileId'])
    );
  }
});
