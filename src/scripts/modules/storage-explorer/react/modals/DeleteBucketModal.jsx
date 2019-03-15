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
            <Modal.Title>Delete bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Do you really want to delete bucket {this.props.bucket.get('id')}?</p>
            {this.props.tables.count() > 0 && (
              <Alert bsStyle="warning">Bucket is not empty. All tables will be also deleted!</Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.deleting}
              isDisabled={this.props.deleting}
              saveLabel={this.props.deleting ? 'Deleting...' : 'Delete'}
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

  onSubmit(event) {
    event.preventDefault();

    this.props.onConfirm().then(this.props.onHide);
  }
});
