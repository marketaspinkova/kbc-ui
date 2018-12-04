import React, { PropTypes } from 'react';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    removing: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={true}>
        <Modal.Header closeButton>
          <Modal.Title>Remove primary key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>
            <p>Do you really want to remove table primary key?</p>
          </span>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={this.props.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} disabled={this.props.removing} bsStyle="danger">
              {this.props.removing ? 'Removing...' : 'Remove'}
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
