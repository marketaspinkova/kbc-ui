import PropTypes from 'prop-types';
import React from 'react';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    onHide: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.node.isRequired,
    show: PropTypes.bool.isRequired
  },

  handleSave: function() {
    this.props.onHide();
    return this.props.onSave();
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
            <Button bsStyle="success" onClick={this.handleSave}>Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
});
