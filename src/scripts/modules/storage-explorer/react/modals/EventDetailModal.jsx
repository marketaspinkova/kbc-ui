import React, { PropTypes } from 'react';
import { Table, Button, Modal, Alert } from 'react-bootstrap';
import { ExternalLink, Tree, NotAvailable } from '@keboola/indigo-ui';
import { format } from '../../../../utils/date';
import FileLink from '../../../sapi-events/react/FileLink';

export default React.createClass({
  propTypes: {
    event: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal show={true} onHide={this.props.onHide} enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title>Event detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderMessage()}
          {this.renderDeprecatedAuthorization()}
          {this.renderDescription()}
          {this.renderDetail()}
          {this.renderAttachments()}
          {this.renderTreeData('Params', 'params')}
          {this.renderTreeData('Performance', 'performance')}
          {this.renderTreeData('Results', 'results')}
          {this.renderTreeData('Context', 'context')}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderDetail() {
    return (
      <Table>
        <tbody>
          <tr>
            <td>ID</td>
            <td>{this.props.event.get('id')}</td>
          </tr>
          <tr>
            <td>Created</td>
            <td>{format(this.props.event.get('created'))}</td>
          </tr>
          <tr>
            <td>Component</td>
            <td>{this.props.event.get('component')}</td>
          </tr>
          <tr>
            <td>Configuration ID</td>
            <td>{this.props.event.get('configurationId') || <NotAvailable/>}</td>
          </tr>
          <tr>
            <td>Run ID</td>
            <td>{this.props.event.get('runId') || <NotAvailable/>}</td>
          </tr>
        </tbody>
      </Table>
    );
  },

  renderMessage() {
    const message = this.props.event.get('message');

    if (!message) {
      return null;
    }

    const type = this.props.event.get('type');
    const validType = ['success', 'warning', 'danger', 'info'].includes(type);

    return <Alert bsStyle={validType ? type : 'info'}>{message}</Alert>;
  },

  renderDeprecatedAuthorization() {
    if (!this.isDeprecatedAuthorization()) {
      return null;
    }

    return (
      <Alert bsStyle="danger">
        <p>
          Used authorization method is deprecated and will be disabled soon.
          <br />
          Please move your tokens from query string parameters to "X-StorageApi-Token" http header. See more in{' '}
          <ExternalLink href="http://docs.keboola.apiary.io/">API documentation</ExternalLink>
        </p>
      </Alert>
    );
  },

  renderDescription() {
    const description = this.props.event.get('description');

    if (!description) {
      return null;
    }

    return <p className="well">{description}</p>;
  },

  renderAttachments() {
    const attachments = this.props.event.get('attachments');

    if (!attachments || !attachments.count()) {
      return null;
    }

    return (
      <div>
        <h3>Attachments</h3>
        <ul>
          {attachments
            .map((attachment, index) => (
              <li key={index}>
                <FileLink file={attachment} />
              </li>
            ))
            .toArray()}
        </ul>
      </div>
    );
  },

  renderTreeData(header, param) {
    const data = this.props.event.get(param);

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

  isDeprecatedAuthorization() {
    return this.props.event.getIn(['context', 'authorization']) === 'deprecated';
  }
});
