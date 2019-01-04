import React from 'react';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    buttonType: React.PropTypes.string,
    buttonLabel: React.PropTypes.string.isRequired,
    text: React.PropTypes.node.isRequired,
    title: React.PropTypes.string.isRequired,
    onConfirm: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    isLoading: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      isLoading: false
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{this.props.text}</div>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            {this.props.isLoading && (
              <Loader />
            )}
            <Button onClick={this.props.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} bsStyle={this.props.buttonType}>
              {this.props.buttonLabel}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    this.props.onHide();
    this.props.onConfirm();
  }
});
