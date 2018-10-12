import React from 'react';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>MySQL SSL Connection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {'For instructions to establish a secure connection to MySQL sandbox see '}
            <a href="https://help.keboola.com/manipulation/transformations/sandbox/#connecting-to-sandbox">
              the documentation
            </a>
            .
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={this.props.onHide}>Close</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
});
