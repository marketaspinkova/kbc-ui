import React from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    onConfirm: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    tableId: React.PropTypes.string.isRequired,
    show: React.PropTypes.bool.isRequired
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
            Do you really want to truncate table <strong>{this.props.tableId}</strong>?
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
