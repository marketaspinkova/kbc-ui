import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { RouteHandler } from 'react-router';
import ApplicationStore from '../../stores/ApplicationStore';
import Header from './Header';
import FloatingNotifications from './FloatingNotifications';
import ErrorPage from '../pages/ErrorPage';
import LoadingPage from '../pages/LoadingPage';
import PageTitle from './PageTitle';
import Wizard from '../../modules/guide-mode/react/Wizard';
import '../../../styles/app.less';

export default createReactClass({
  propTypes: {
    isError: PropTypes.bool,
    isLoading: PropTypes.bool
  },

  getInitialState() {
    return {
      organizations: ApplicationStore.getOrganizations(),
      maintainers: ApplicationStore.getMaintainers(),
      notifications: ApplicationStore.getNotifications(),
      currentProject: ApplicationStore.getCurrentProject(),
      currentAdmin: ApplicationStore.getCurrentAdmin(),
      urlTemplates: ApplicationStore.getUrlTemplates(),
      projectTemplates: ApplicationStore.getProjectTemplates(),
      xsrf: ApplicationStore.getXsrfToken(),
      canCreateProject: ApplicationStore.getCanCreateProject(),
      canManageApps: ApplicationStore.getKbcVars().get('canManageApps'),
      projectHasGuideModeOn: ApplicationStore.getKbcVars().get('projectHasGuideModeOn'),
      homeUrl: ApplicationStore.getUrlTemplates().get('home'),
      projectFeatures: ApplicationStore.getCurrentProjectFeatures(),
      projectBaseUrl: ApplicationStore.getProjectBaseUrl(),
      scriptsBasePath: ApplicationStore.getScriptsBasePath(),
      lookerPreview: ApplicationStore.hasLookerPreview()
    };
  },

  render() {
    return (
      <div className={classnames({ 'looker-ui': this.state.lookerPreview })}>
        {this.state.projectHasGuideModeOn === true && (
          <div className="guide-status-bar">
            <p>{'Guide Mode '}</p>
            <p>{'\xa0- learn everything you need to know about Keboola Connection'}</p>
          </div>
        )}
        <PageTitle />
        <Header 
          homeUrl={this.state.homeUrl} 
          notifications={this.state.notifications} 
          currentAdmin={this.state.currentAdmin}
          maintainers={this.state.maintainers}
          urlTemplates={this.state.urlTemplates}
          canManageApps={this.state.canManageApps}
          organizations={this.state.organizations}
          currentProject={this.state.currentProject}
          xsrf={this.state.xsrf}
          canCreateProject={this.state.canCreateProject}
          projectTemplates={this.state.projectTemplates}
        />
        <FloatingNotifications />
        <div className="container">
          <div className="kbc-main">
            {this.renderMain()}
          </div>
          {this.state.projectHasGuideModeOn === true && (
            <Wizard
              projectBaseUrl={this.state.projectBaseUrl}
              scriptsBasePath={this.state.scriptsBasePath}
            />
          )}
        </div>
      </div>
    );
  },

  renderMain() {
    if (this.props.isError) {
      return <ErrorPage />;
    }

    if (this.props.isLoading) {
      return <LoadingPage />;
    }

    return <RouteHandler />;
  }
});
