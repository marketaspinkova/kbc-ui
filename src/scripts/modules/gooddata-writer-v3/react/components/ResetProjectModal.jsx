import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Checkbox} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    pid: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    isReseting: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      deleteProject: false
    };
  },

  render() {
    const {pid} = this.props;
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>
            Disconnect GoodData Project
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You are about to disconnect GoodData Project {pid} from the configuration.
          <Checkbox
            checked={this.state.deleteProject}
            onChange={(e) => this.setState({deleteProject: e.target.checked})}>
            Also remove GoodData Project
          </Checkbox>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Disconnect"
            saveStyle="danger"
            isSaving={this.props.isReseting || this.props.disabled}
            onCancel={this.props.onHide}
            onSave={this.handleConfirm}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    return this.props.onConfirm(this.state.deleteProject);
  }
});
