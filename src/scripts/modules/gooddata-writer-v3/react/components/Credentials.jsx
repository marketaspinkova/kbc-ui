import React, {PropTypes} from 'react';
import {Loader, ExternalLink} from '@keboola/indigo-ui';
import CreateProjectModal from './CreateProjectModal';
import ComponentsStore from '../../../components/stores/ComponentsStore';

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
    onToggleEnableAcess: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      showCreateProjectModal: false
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

  render() {
    return (
      <div>
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
    const {provisioning: {isLoading}} = this.props;

    if (isLoading) {
      return <span><Loader /> Loading</span>;
    }

    if (!this.isConnected()) {
      return this.renderNoCredentials();
    }

    return (
      <div>
        {this.renderActionsRow()}
        {this.renderInfoRow()}
      </div>
    );
  },

  getProjectDescription() {
    if (!this.isKeboolaProvisioned()) {
      return 'User Own Project';
    }

    let token = this.props.provisioning.data.get('token', '');
    if (['demo', 'production'].includes(token)) {
      token = 'keboola_' + token;
    }
    if (token) {
      switch (token) {
        case 'keboola_demo': {
          return 'Keboola DEMO Provisioned project';
        }
        case 'keboola_production': {
          return 'Keboola PRODUCTION Provisioned project';
        }
        default: {
          return 'Keboola Custom Provisioned project';
        }
      }
    }
  },

  renderInfoRow() {
    const projectDescription = this.getProjectDescription();
    return (
      <div>
        <h4>Connected to {projectDescription}</h4>
        <div>GoodData Project Id: {this.props.config.pid}</div>
        <div>GoodData Project Login: {this.props.config.login}</div>
      </div>
    );
  },

  renderActionsRow() {
    const isProvisioned = this.isKeboolaProvisioned();
    const hasSso = this.isSsoEnabled();
    return (
      <div className="btn-toolbar form-group">
        {!isProvisioned &&
         <button className="btn btn-success pull-right"
           onClick={() => this.setState({showCreateProjectModal: true})}>
           Change
         </button>
        }
        {!isProvisioned && this.renderGoToProjectLink()}

        {isProvisioned && !hasSso && this.renderEnableAccessButton()}
        {isProvisioned &&  hasSso && this.renderDisableAccessButton()}
        {isProvisioned &&  hasSso && this.renderLoginToProjectLink()}

      </div>
    );
  },

  isConnected() {
    return !!this.props.config.pid;
  },

  isKeboolaProvisioned() {
    return this.isConnected() && !!this.props.provisioning.data;
  },

  isSsoEnabled() {
    return this.isKeboolaProvisioned() && !!this.props.provisioning.data.get('sso');
  },

  renderGoToProjectLink() {
    let gdUrl = 'https://secure.gooddata.com/#s=/gdc/projects';
    const componentUri = ComponentsStore.getComponent('gooddata-writer').get('uri');
    if (componentUri === 'https://syrup.eu-central-1.keboola.com/gooddata-writer') {
      gdUrl = 'https://keboola.eu.gooddata.com/gdc/projects';
    }
    const targetUrl = `${gdUrl}/${this.props.config.pid}|projectDashboardPage`;
    return (
      <ExternalLink href={targetUrl} className="btn btn-link pull-right">
        <span className="fa fa-bar-chart-o fa-fw"/>
        Go To Project
      </ExternalLink>
    );
  },

  getGoodDataLoginUrl() {
    let loginUrl = 'https://secure.gooddata.com/gdc/account/customerlogin';
    const componentUri = ComponentsStore.getComponent('gooddata-writer').get('uri');
    if (componentUri === 'https://syrup.eu-central-1.keboola.com/gooddata-writer') {
      loginUrl = 'https://keboola.eu.gooddata.com/gdc/account/customerlogin';
    }
    return loginUrl;
  },

  renderLoginToProjectLink() {
    const {pid} = this.props.config;
    const sso = this.props.provisioning.data.get('sso');
    const targetUrl = `/#s=/gdc/projects/${pid}|projectDashboardPage`;
    const submitUrl = this.getGoodDataLoginUrl();

    return (
      <form
        className="pull-right"
        target="_blank"
        method="POST"
        action={submitUrl}>
        {sso.map((value, name) =>
          <input key={name} type="hidden" name={name} value={value}/>
        ).toArray()}
        <input key="targetUrl" type="hidden" name="targetUrl" value={targetUrl}/>
        <button type="submit"
          className="btn btn-link">
          <span className="fa fa-bar-chart-o fa-fw"/>
          Go To Project
        </button>
      </form>
    );
  },


  renderDisableAccessButton() {
    return (
      <button type="button"
        className="btn btn-link pull-right"
        onClick={() => this.props.onToggleEnableAcess(this.props.config.pid, false)}>
        <span className="fa fa-unlink fa-fw" />
        Disable Access To Project
      </button>
    );
  },

  renderEnableAccessButton() {
    return (
      <button type="button"
        className="btn btn-link pull-right"
        onClick={() => this.props.onToggleEnableAcess(this.props.config.pid, true)}>
        <span className="fa fa-link fa-fw" />
        Enable Access To Project
      </button>
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
