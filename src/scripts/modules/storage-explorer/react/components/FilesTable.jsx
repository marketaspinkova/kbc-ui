import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import moment from 'moment';
import { Table, Button, Label } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { format } from '../../../../utils/date';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import Clipboard from '../../../../react/common/Clipboard';
import FileSize from '../../../../react/common/FileSize';
import Tooltip from '../../../../react/common/Tooltip';
import FileLink from '../../../sapi-events/react/FileLink';
import FileLinkButton from './FileLinkButton';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    files: PropTypes.object.isRequired,
    onSearchByTag: PropTypes.func.isRequired,
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
              <th>Uploaded</th>
              <th>Name</th>
              <th>Size</th>
              <th>URL</th>
              <th className="text-center">Public</th>
              <th className="text-center">Encrypted</th>
              <th className="text-center">Permanent</th>
              <th>Creator</th>
              <th>Tags</th>
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
        <td>{file.get('id')}</td>
        <td>{format(file.get('created'), 'YYYY-MM-DD HH:mm')}</td>
        <td>
          <FileLink file={file} showFilesize={false} />
        </td>
        <td>
          <FileSize size={file.get('sizeBytes')} />
        </td>
        <td>{this.renderClipboard(file)}</td>
        <td className="text-center">
          {file.get('isPublic') ? <i className="fa fa-check" /> : <i className="fa fa-times" />}
        </td>
        <td className="text-center">
          {file.get('isEncrypted') ? <i className="fa fa-check" /> : <i className="fa fa-times" />}
        </td>
        <td className="text-center">{this.expiration(file)}</td>
        <td>
          <span>{file.getIn(['creatorToken', 'description'])}</span>
        </td>
        <td>
          {file.get('tags').map((tag, index) => (
            <Label
              key={index}
              className="kbc-cursor-pointer"
              bsStyle="success"
              onClick={() => this.props.onSearchByTag(tag)}
            >
              {tag}
            </Label>
          ))}
        </td>
        <td>
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
      return <i className="fa fa-check" />;
    }

    const now = moment();
    const expiresOn = moment(file.get('created')).add(maxAgeDays, 'days');
    const diffDays = expiresOn.diff(now, 'days');

    if (diffDays > 0) {
      return (
        <Tooltip placement="right" tooltip={`Expires in ${diffDays} days`}>
          <i className="fa fa-times" />
        </Tooltip>
      );
    }

    const diffMinutes = expiresOn.diff(now, 'minutes');

    if (diffMinutes > 0) {
      return (
        <Tooltip placement="right" tooltip={`Expires in ${diffMinutes} minutes`}>
          <i className="fa fa-times" />
        </Tooltip>
      );
    }

    return (
      <Tooltip placement="right" tooltip={`Expired ${format(expiresOn, 'YYYY-MM-DD HH:mm')}`}>
        <Label bsStyle="danger">Expired</Label>
      </Tooltip>
    );
  },

  renderClipboard(file) {
    return <Clipboard tooltipText="Copy file URL to clipboard" text={file.get('url')} />;
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
