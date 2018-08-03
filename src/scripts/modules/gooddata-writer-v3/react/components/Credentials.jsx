import React, {PropTypes} from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';
import {isNewProjectValid, TokenTypes} from '../../provisioning/utils';
import {Loader} from '@keboola/indigo-ui';
import ResetProjectModal from './ResetProjectModal';

export default React.createClass({
  propTypes: {
    provisioning: PropTypes.shape({
      isDeleting: PropTypes.bool.isRequired,
      isCreating: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
      canCreateProdProject: PropTypes.bool.isRequired,
      data: PropTypes.object
    }),
    config: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired
    }),
    disabled: PropTypes.bool.isRequired,
    onHandleCreate: PropTypes.func.isRequired,
    onToggleEnableAcess: PropTypes.func.isRequired,
    onHandleResetProject: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      showModal: false,
      showResetProjectModal: false,
      newProject: {
        name: '',
        login: '',
        password: '',
        pid: '',
        customToken: '',
        isCreateNewProject: true,
        tokenType: TokenTypes.DEMO
      }
    };
  },

  openModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({showModal: true});
  },

  closeModal() {
    if (!this.props.disabled && !this.props.provisioning.isCreating) {
      this.setState(this.getInitialState());
    }
  },

  renderModal() {
    return (
      <Modal onHide={this.closeModal} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            Setup GoodData Project
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <NewProjectForm
            canCreateProdProject={this.props.provisioning.canCreateProdProject}
            value={this.state.newProject}
            onChange={val => this.setState({newProject: val})}
            disabled={this.props.disabled || this.props.provisioning.isCreating}
          />
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.disabled || this.props.provisioning.isCreating}
            isDisabled={!this.isValid()}
            saveLabel={this.state.newProject.isCreateNewProject ? 'Create' : 'Save'}
            onCancel={this.closeModal}
            onSave={this.handleCreate}/>
        </Modal.Footer>
      </Modal>
    );
  },

  render() {
    return (
      <div>
        <ResetProjectModal
          isReseting={this.props.provisioning.isDeleting}
          show={this.state.showResetProjectModal}
          pid={this.props.config.pid}
          onHide={() => this.setState({showResetProjectModal: false})}
          onConfirm={this.handleResetProject}
          disabled={this.props.disabled}
        />
        {this.renderModal()}
        {this.renderProvisioning()}
      </div>
    );
  },

  renderProvisioning() {
    const {data} = this.props.provisioning;
    const {pid} = this.props.config;
    const {isLoading} = this.props.provisioning;
    if (isLoading) {
      return <Loader />;
    }
    if (!pid) {
      return this.renderNoCredentials();
    }
    if (!data) {
      return this.renderOwnCredentials();
    }
    if (!data.get('sso')) {
      return this.renderKbcNoSSO();
    }
    return this.renderKbcWithSSO();
  },

  handleResetProject(deleteProject) {
    return this.props.onHandleResetProject(deleteProject).then(() => {
      if (!this.props.disabled && !this.props.provisioning.isDeleting) {
        this.setState({showResetProjectModal: false});
      }
    });
  },

  renderResetProject() {
    return (
      <span>
        <button type="button"
          onClick={() => this.setState({showResetProjectModal: true})}
          className="btn btn-danger">
          Reset Project
        </button>
      </span>
    );
  },

  renderKbcWithSSO() {
    const {pid} = this.props.config;
    const token = this.props.provisioning.data.get('token');
    const sso = this.props.provisioning.data.get('sso');
    return (
      <div>
        <div>Keboola Provisioned GoodData Project({pid}).</div>
        <div> Token: {token}</div>
        <form
          target="_blank noopener noreferrer"
          method="POST"
          action="https://secure.gooddata.com/gdc/account/customerlogin">
          {sso.map((value, name) =>
            <input key={name} type="hidden" name={name} value={value}/>
          ).toArray()}
          <input key="targetUrl" type="hidden" name="targetUrl" value={`/#s=/gdc/projects/${pid}|projectDashboardPage`}/>
          <button type="submit"
            className="btn btn-success">
            Go To Project
          </button>
          <button type="button"
            onClick={() => this.props.onToggleEnableAcess(pid, false)}>
            Disable Access
          </button>
        </form>
        {this.renderResetProject()}
      </div>
    );
  },

  renderKbcNoSSO() {
    const {pid} = this.props.config;
    const token = this.props.provisioning.data.get('token');
    return (
      <div>
        <div>Keboola Provisioned GoodData Project({pid}).</div>
        <div> Token: {token}</div>
        <button
          onClick={() => this.props.onToggleEnableAcess(pid, true)}
          className="btn btn-success">
          Enable Access
        </button>
        {this.renderResetProject()}
      </div>
    );
  },

  onEditCredentials(e) {
    e.preventDefault();
    e.stopPropagation();
    const newProject = {...this.props.config, isCreateNewProject: false};
    this.setState({newProject}, () => this.openModal());
  },

  renderOwnCredentials() {
    const {pid, login} = this.props.config;
    return (
      <div>
        <h4>The GoodDataProject is not provisioned by Keboola</h4>
        <div> Project: {pid}</div>
        <div> User: {login}</div>
        <button onClick={this.onEditCredentials} className="btn btn-success">
          Edit
        </button>
      </div>
    );
  },

  renderNoCredentials() {
    return (
      <div className="component-empty-state text-center">
        <p>No project set up yet.</p>
        <button
          disabled={this.props.disabled || this.props.provisioning.isCreating}
          onClick={this.openModal}
          className="btn btn-success">
          Setup GoodData Project
        </button>
      </div>
    );
  },

  isValid() {
    return isNewProjectValid(this.state.newProject);
  },

  handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onHandleCreate(this.state.newProject).then(this.closeModal);
  }

});
