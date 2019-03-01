import React from 'react';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    onRequestRun: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.node.isRequired,
    show: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired
  },

  _handleRun: function() {
    this.props.onHide();
    return this.props.onRequestRun();
  },

  render: function() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.body}
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button bsStyle="link" onClick={this.props.onHide}>Close</Button>
            <Button bsStyle="primary" onClick={this._handleRun} disabled={this.props.disabled}>Run</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
});
