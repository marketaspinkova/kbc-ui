import React from 'react';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';
import {isNewProjectValid, TokenTypes} from '../../provisioning/utils';

export default React.createClass({
  propTypes: {
    config: React.PropTypes.object.isRequired,
    onCreate: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    isCreating: React.PropTypes.bool.isRequired,
    canCreateProdProject: React.PropTypes.bool.isRequired
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
        <Modal.Header closeButton={true}>
          <Modal.Title>
            Setup GoodData Project
          </Modal.Title>
        </Modal.Header>

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
            isSaving={this.props.disabled || this.props.isCreating}
            isDisabled={!this.isValid()}
            saveLabel={this.state.newProject.isCreateNewProject ? 'Create' : 'Save'}
            onCancel={this.props.onHide}
            onSave={() => this.props.onCreate(this.state.newProject)}/>
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    return isNewProjectValid(this.state.newProject);
  }

});
