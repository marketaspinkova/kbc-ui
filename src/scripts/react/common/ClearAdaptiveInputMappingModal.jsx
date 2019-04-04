import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    onHide: PropTypes.func.isRequired,
    onRequestRun: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  _handleRun: function(e) {
    this.props.onHide();
    return this.props.onRequestRun(e);
  },

  render: function() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Reset Last Successful Run
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ABCD
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button bsStyle="link" onClick={this.props.onHide}>Close</Button>
            <Button bsStyle="primary" onClick={this._handleRun} disabled={this.props.disabled}>Clear</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
});
