import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
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
        <Modal.Header closeButton>
          <Modal.Title>Delete bucket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>
            <p>Do you really want to delete bucket {this.props.bucket.get('id')}?</p>
            {this.props.tables.count() > 0 && <p>Bucket is not empty. All tables will be also deleted!</p>}
          </span>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.deleting}
            isDisabled={this.props.deleting}
            saveLabel={this.props.deleting ? 'Deleting...' : 'Delete'}
            saveStyle="danger"
            onCancel={this.props.onHide}
            onSave={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleSubmit() {
    this.props.onConfirm().then(this.props.onHide);
  }
});
