import React, {PropTypes} from 'react';
import {Loader} from '@keboola/indigo-ui';
import ResetProjectModal from './ResetProjectModal';
import CreateProjectModal from './CreateProjectModal';

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
      showCreateProjectModal: false,
      showResetProjectModal: false
    };
  },

  closeCreateProjectModal() {
    if (!this.props.disabled && !this.props.provisioning.isCreating) {
      this.setState({showCreateProjectModal: false});
    }
  },

  handleCreateProject(newProject) {
    this.props.onHandleCreate(newProject).then(this.closeCreateProjectModal);
  },


  closeResetProjectModal() {
    if (!this.props.disabled && !this.props.provisioning.isDeleting) {
      this.setState({showResetProjectModal: false});
    }
  },

  handleResetProject(deleteProject) {
    return this.props.onHandleResetProject(deleteProject).then(this.closeResetProjectModal);
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
        <CreateProjectModal
          isCreating={this.props.provisioning.isCreating}
          show={this.state.showCreateProjectModal}
          onHide={this.closeCreateProjectModal}
          onCreate={this.handleCreateProject}
          disabled={this.props.disabled}
          canCreateProdProject={this.props.provisioning.canCreateProdProject}
          config={this.props.config}
        />
        {this.renderProvisioning()}
      </div>
    );
  },

  renderProvisioning() {
    const {data, isLoading} = this.props.provisioning;
    const {pid} = this.props.config;

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

  renderOwnCredentials() {
    const {pid, login} = this.props.config;
    return (
      <div>
        <h4>The GoodDataProject is not provisioned by Keboola</h4>
        <div> Project: {pid}</div>
        <div> User: {login}</div>
        <button onClick={() => this.setState({showCreateProjectModal: true})}
          className="btn btn-success">
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
          disabled={this.props.disabled}
          onClick={() => this.setState({showCreateProjectModal: true})}
          className="btn btn-success">
          Setup GoodData Project
        </button>
      </div>
    );
  }

});
