import React, { PropTypes } from 'react';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';

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
          <ButtonToolbar>
            <Button onClick={this.props.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} disabled={this.props.deleting} bsStyle="danger">
              {this.props.deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    this.props.onConfirm().then(this.props.onHide);
  }
});
