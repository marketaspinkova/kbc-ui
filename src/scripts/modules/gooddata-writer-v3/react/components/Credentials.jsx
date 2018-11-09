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
      <div className="kbc-inner-padding">
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
    const {provisioning: {data, isLoading}, config: {pid}} = this.props;

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
      return this.renderKeboolaCredentialsWithoutSSO();
    }
    return this.renderKeboolaCredentialsWithSSO();
  },

  renderKeboolaCredentialsWithSSO() {
    const {pid} = this.props.config;
    const token = this.props.provisioning.data.get('token');
    const sso = this.props.provisioning.data.get('sso');
    const targetUrl = `/#s=/gdc/projects/${pid}|projectDashboardPage`;
    const submitUrl = 'https://secure.gooddata.com/gdc/account/customerlogin';
    return (
      <div>
        <div>
          <form
            target="_blank noopener noreferrer"
            method="POST"
            action={submitUrl}>
            {sso.map((value, name) =>
              <input key={name} type="hidden" name={name} value={value}/>
            ).toArray()}
            <input key="targetUrl" type="hidden" name="targetUrl" value={targetUrl}/>
            <div className="pull-right">
              {this.renderGoToProjectSubmitButton()}
              {this.renderDisableAccessButton()}
              {this.renderResetProjectButton()}
            </div>
          </form>
        </div>
        <div>
          <h4>Provisioned By Keboola</h4>
          <div> Project Id: {pid}</div>
          <div> Token: {token}</div>
        </div>
      </div>
    );
  },

  renderKeboolaCredentialsWithoutSSO() {
    const {pid} = this.props.config;
    const token = this.props.provisioning.data.get('token');
    return (
      <div>
        <h4>Provisioned by Keboola</h4>
        <div>GoodData Project Id: {pid}</div>
        <div>Token: {token}</div>
        {this.renderEnableAccessButton()}
        {this.renderResetProjectButton()}
      </div>
    );
  },

  renderResetProjectButton() {
    return (
      <button type="button"
        onClick={() => this.setState({showResetProjectModal: true})}
        className="btn btn-danger pull-right">
        Reset Project
      </button>
    );
  },

  renderGoToProjectSubmitButton() {
    return (
      <button type="submit"
        className="btn btn-link">
        <span className="fa fa-bar-chart-o fa-fw"/>
        Go To Project
      </button>
    );
  },

  renderDisableAccessButton() {
    return (
      <button type="button"
        className="btn btn-link"
        onClick={() => this.props.onToggleEnableAcess(this.props.config.pid, false)}>
        <span className="fa fa-unlink fa-fw" />
        Disable Access To Project
      </button>
    );
  },

  renderEnableAccessButton() {
    return (
      <button type="button"
        className="btn btn-link"
        onClick={() => this.props.onToggleEnableAcess(this.props.config.pid, true)}>
        <span className="fa fa-link fa-fw" />
        Enable Access To Project
      </button>
    );
  },

  renderOwnCredentials() {
    const {pid, login} = this.props.config;
    return (
      <div>
        <button className="btn btn-success pull-right"
          onClick={() => this.setState({showCreateProjectModal: true})}>
          Change
        </button>
        <h4>Not provisioned by Keboola</h4>
        <div>GoodData Project Id: {pid}</div>
        <div>GoodData Username: {login}</div>
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
