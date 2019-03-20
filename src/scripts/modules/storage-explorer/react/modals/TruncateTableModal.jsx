import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default createReactClass({
  propTypes: {
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    tableId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isPending: false
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>Truncate table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you really want to truncate the table <strong>{this.props.tableId}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.state.isPending}
            isDisabled={this.state.isPending}
            saveLabel={this.state.isPending ? 'Truncating...' : 'Truncate'}
            saveStyle="danger"
            onCancel={this.props.onHide}
            onSave={this.handleConfirm}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    this.setState({
      isPending: true
    });
    this.props.onConfirm().finally(() => {
      this.setState({ isPending: false }, () => {
        this.props.onHide();
      });
    });
  }
});
