import React, {PropTypes} from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      newProject: {},
      showModal: false
    };
  },

  openModal(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showModal: true});
  },

  closeModal() {
    if (!this.props.disabled) {
      this.setState({showModal: false, newProject: {}});
    }
  },

  renderModal() {
    return (
      <Modal onHide={this.closeModal} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            + Create Project
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <NewProjectForm
            value={this.state.newProject}
            onChange={val => this.setState({newProject: val})}
            disabled={this.props.disabled}
          />
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.disabled}
            isDisabled={!this.isValid()}
            saveLabel="Create"
            onCancel={this.closeModal}
            onSave={this.handleCreate}/>
        </Modal.Footer>
      </Modal>
    );
  },

  render() {
    return (
      <div>
        {this.renderModal()}
        Your project is {this.props.value.pid}
        <div className="text-right">
          <button
            disabled={this.props.disabled}
            onClick={this.openModal}
            className="btn btn-success">
            + New Project
          </button>
        </div>
      </div>
    );
  },

  isValid() {
    return true;
  },

  handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    // TODO
    const newProject = {...this.state.newProject};
    this.props.onSave({newProject}).then(this.closeModal);
  }

});
