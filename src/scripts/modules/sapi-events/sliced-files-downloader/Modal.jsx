import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal, Button} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import ConfirmButtons from '../../../react/common/ConfirmButtons';
import FileSize from '../../../react/common/FileSize';

export default createReactClass({
  propTypes: {
    isModalOpen: PropTypes.bool.isRequired,
    onModalHide: PropTypes.func.isRequired,
    onPrepareStart: PropTypes.func.isRequired,
    file: PropTypes.object.isRequired,
    createdFile: PropTypes.object,
    isRunning: PropTypes.bool.isRequired,
    progress: PropTypes.string,
    progressStatus: PropTypes.string
  },

  render() {
    return (
      <Modal show={this.props.isModalOpen} onHide={this.props.onModalHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            Sliced File Download
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>File <strong>{this.props.file.get('name')} (<FileSize size={this.props.file.get('sizeBytes')} />)</strong> is sliced into multiple chunks.</p>
          <p>All chunks will be packed into a <code>ZIP</code> file, you will be given link to download the file.</p>
        </Modal.Body>
        <Modal.Footer>
          {this.renderStatusBar()}
          {this.props.createdFile ?
            <div className="kbc-buttons">
              <Button
                bsStyle="link"
                onClick={this.props.onModalHide}>
                Close
              </Button>
              <ExternalLink href={this.props.createdFile.get('url')} className="btn btn-success">
                Download
              </ExternalLink>
            </div>
            :
            <ConfirmButtons
              onCancel={this.props.onModalHide}
              onSave={this.props.onPrepareStart}
              saveLabel={'Prepare Package'}
              cancelLabel={'Close'}
              isSaving={this.props.isRunning}
            />
          }

        </Modal.Footer>
      </Modal>
    );
  },

  renderStatusBar() {
    if (!this.props.progress) {
      return null;
    }
    return (
      <div className="pull-left" style={{padding: '6px 15px'}}>
        <span className={'text-' + this.props.progressStatus}>
          {this.renderStatusIcon(this.props.progressStatus)} {this.props.progress}
          <span />
        </span>
      </div>
    );
  },

  renderStatusIcon(progressStatus) {
    if (progressStatus === 'success') {
      return (
        <span className="fa fa-check"/>
      );
    } else if (progressStatus === 'danger') {
      return (
        <span className="fa fa-times"/>
      );
    } else {
      return null;
    }
  }
});
