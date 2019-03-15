import PropTypes from 'prop-types';
import React from 'react';
import {Form, Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';
import {isNewProjectValid, TokenTypes} from '../../gooddataProvisioning/utils';

export default React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    isCreating: PropTypes.bool.isRequired,
    canCreateProdProject: PropTypes.bool.isRequired
  },

  getInitialState() {
    const isCreateNewProject = !this.props.config.pid;
    return {
      newProject: {
        isCreateNewProject,
        name: '',
        login: isCreateNewProject ? '' : this.props.config.login,
        password: isCreateNewProject ? '' : this.props.config.password,
        pid: isCreateNewProject ? '' : this.props.config.pid,
        customToken: '',
        tokenType: TokenTypes.DEMO
      }
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>
            Setup GoodData Project
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Body>
            <NewProjectForm
              canCreateProdProject={this.props.canCreateProdProject}
              value={this.state.newProject}
              onChange={val => this.setState({newProject: val})}
              disabled={this.props.disabled || this.props.isCreating}
            />
          </Modal.Body>

          <Modal.Footer>
            <ConfirmButtons
              saveButtonType="submit"
              isSaving={this.props.disabled || this.props.isCreating}
              isDisabled={!this.isValid()}
              saveLabel={this.state.newProject.isCreateNewProject ? 'Create Project' : 'Update Project'}
              onCancel={this.props.onHide}
              onSave={this.onSubmit}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  isValid() {
    return isNewProjectValid(this.state.newProject);
  },

  onSubmit(event) {
    event.preventDefault();

    return this.props.onCreate(this.state.newProject);
  }
});
