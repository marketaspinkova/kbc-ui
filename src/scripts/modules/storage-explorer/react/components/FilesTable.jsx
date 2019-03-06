import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import moment from 'moment';
import { Table, Button, Label } from 'react-bootstrap';
import { Finished, Loader } from '@keboola/indigo-ui';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import Clipboard from '../../../../react/common/Clipboard';
import FileSize from '../../../../react/common/FileSize';
import Tooltip from '../../../../react/common/Tooltip';
import FileLink from '../../../sapi-events/react/FileLink';
import FileLinkButton from './FileLinkButton';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    files: PropTypes.object.isRequired,
    onSearchQuery: PropTypes.func.isRequired,
    onDeleteFile: PropTypes.func.isRequired,
    isDeleting: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showDeleteModal: false,
      deleteFile: null
    };
  },

  render() {
    if (!this.props.files.count()) {
      return null;
    }

    return (
      <div>
        {this.renderDeleteModal()}

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Detail</th>
              <th>State</th>
              <th />
            </tr>
          </thead>
          <tbody>{this.props.files.map(this.renderRow).toArray()}</tbody>
        </Table>
      </div>
    );
  },

  renderRow(file) {
    return (
      <tr key={file.get('id')}>
        <td>
          <button
            className="btn btn-link btn-link-inline"
            onClick={() => this.props.onSearchQuery(`id:${file.get('id')}`)}
          >
            {file.get('id')}
          </button>
        </td>
        <td>
          <FileLink file={file} showFilesize={false} />
          {file.get('tags').count() > 0 && this.renderTags(file)}
        </td>
        <td>
          <table className="files-inner-table">
            <tbody>
              <tr>
                <td>File size</td>
                <td><FileSize size={file.get('sizeBytes')} /></td>
              </tr>
              <tr>
                <td>Creator</td>
                <td>{file.getIn(['creatorToken', 'description'])}</td>
              </tr>
              <tr>
                <td>Uploaded</td>
                <td><Finished showIcon endTime={file.get('created')} /></td>
              </tr>
            </tbody>
          </table>
        </td>
        <td>
            {file.get('isPublic') && (
              <div>Public</div>
            )}
            {!file.get('isEncrypted') && (
              <div>Not encrypted</div>
            )}
            {this.expiration(file)}
        </td>
        <td className="files-action-buttons">
          {this.renderClipboard(file)}
          <FileLinkButton file={file} />
          {this.renderDeleteFile(file)}
        </td>
      </tr>
    );
  },

  renderDeleteModal() {
    const file = this.state.deleteFile;

    if (!file) {
      return null;
    }

    return (
      <ConfirmModal
        show={this.state.showDeleteModal}
        onHide={this.closeDeleteModal}
        title="Delete file"
        text={
          <p>
            Do you really want to delete file {file.get('id')} ({file.get('name')})?
          </p>
        }
        buttonLabel="Delete"
        buttonType="danger"
        onConfirm={() => this.props.onDeleteFile(file.get('id'))}
      />
    );
  },

  expiration(file) {
    const maxAgeDays = file.get('maxAgeDays', null);

    if (maxAgeDays === null) {
      return 'Permanent';
    }

    const now = moment();
    const expiresOn = moment(file.get('created')).add(maxAgeDays, 'days');
    const diffDays = expiresOn.diff(now, 'days');

    if (diffDays > 0) {
      return <div className="text-success">Expires in {diffDays} days</div>;
    }

    const diffMinutes = expiresOn.diff(now, 'minutes');

    if (diffMinutes > 0) {
      return <div className="text-success">Expires in {diffMinutes} minutes</div>;
    }

    return <div className="text-danger">Expired</div>;
  },

  renderClipboard(file) {
    return (
      <Clipboard
        tooltipText="Copy file URL to clipboard"
        tooltipPlacement="top"
        text={file.get('url')}
      />
    );
  },

  renderDeleteFile(file) {
    const isDeleting = this.props.isDeleting.get(file.get('id'), false);

    if (isDeleting) {
      return (
        <Button bsStyle="link" disabled>
          <Loader />
        </Button>
      );
    }

    return (
      <Tooltip placement="top" tooltip="Delete file">
        <Button bsStyle="link" onClick={() => this.openDeleteModal(file)}>
          <i className="fa fa-trash-o" />
        </Button>
      </Tooltip>
    );
  },

  renderTags(file) {
    return (
      <div>
        {file.get('tags').map((tag, index) => (
          <Label
            key={index}
            className="kbc-cursor-pointer"
            bsStyle="success"
            onClick={() => this.props.onSearchQuery(`tags:${tag}`)}
          >
            {tag}
          </Label>
        ))}
      </div>
    );
  },

  openDeleteModal(file) {
    this.setState({
      showDeleteModal: true,
      deleteFile: file
    });
  },

  closeDeleteModal() {
    this.setState({
      showDeleteModal: false,
      deleteFile: null
    });
  }
});
