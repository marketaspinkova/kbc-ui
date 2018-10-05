import React from 'react';
import {Modal, Checkbox} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    pid: React.PropTypes.string,
    onConfirm: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    isReseting: React.PropTypes.bool.isRequired
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
            Reset GoodData Project
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
            saveLabel="Reset"
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
