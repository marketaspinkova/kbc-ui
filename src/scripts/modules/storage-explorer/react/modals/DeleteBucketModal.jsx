import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Form, Alert } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    deleting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Form onSubmit={this.onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{this.renderTitle()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Do you really want to{' '}
              {this.props.bucket.has('sourceBucket') ? 'unlink' : 'delete'}{' '}
              bucket {this.props.bucket.get('id')}?</p>
            {this.renderWarning()}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.deleting}
              isDisabled={this.props.deleting}
              saveLabel={this.saveLabel()}
              onCancel={this.props.onHide}
              onSave={this.onSubmit}
              saveStyle="danger"
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderTitle() {
    if (this.props.bucket.has('sourceBucket')) {
      return <span>Unlink bucket</span>;
    }

    return <span>Delete bucket</span>;
  },

  renderWarning() {
    if (this.props.bucket.has('sourceBucket') || this.props.tables.count() === 0) {
      return null;
    }

    return <Alert bsStyle="warning">Bucket is not empty. All tables will be also deleted!</Alert>;
  },

  saveLabel() {
    if (this.props.bucket.has('sourceBucket')) {
      return this.props.deleting ? 'Unlinking...' : 'Unlink';
    }
    
    return this.props.deleting ? 'Deleting...' : 'Delete';
  },

  onSubmit(event) {
    event.preventDefault();

    this.props.onConfirm().then(this.props.onHide);
  }
});
