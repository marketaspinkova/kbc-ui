import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    buttonType: PropTypes.string,
    buttonLabel: PropTypes.string.isRequired,
    text: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
    closeAfterResolve: PropTypes.bool
  },

  getDefaultProps() {
    return {
      isLoading: false,
      closeAfterResolve: false
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{this.props.text}</div>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            {this.props.isLoading && <Loader />}
            <Button onClick={this.props.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button
              onClick={this.handleConfirm}
              bsStyle={this.props.buttonType}
              disabled={this.props.isLoading}
            >
              {this.props.buttonLabel}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    if (this.props.closeAfterResolve) {
      return this.props.onConfirm().then(this.props.onHide);
    }

    this.props.onHide();
    this.props.onConfirm();
  }
});
