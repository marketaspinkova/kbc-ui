import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from './ConfirmButtons';

export default createReactClass({
  propTypes: {
    onHide: PropTypes.func.isRequired,
    onRequestRun: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  _handleRun(e) {
    this.props.onHide();
    return this.props.onRequestRun(e);
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Automatic Incremetal Load</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will clear the information about automatic incremental load. Next execution will load all
          data in the table.
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={false}
            onSave={this._handleRun}
            disabled={this.props.disabled}
            onCancel={this.props.onHide}
            saveLabel="Reset"
            saveStyle="primary"
            cancelLabel="Close"
          />
        </Modal.Footer>
      </Modal>
    );
  }
});
