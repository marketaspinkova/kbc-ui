import React from 'react';
import classnames from 'classnames';
import { RouteHandler } from 'react-router';
import ApplicationStore from '../../stores/ApplicationStore';
import Header from './Header';
import SidebarNavigation from './SidebarNavigation';
import FloatingNotifications from './FloatingNotifications';
import ErrorPage from '../pages/ErrorPage';
import LoadingPage from '../pages/LoadingPage';
import ProjectSelect from './project-select/ProjectSelect';
import PageTitle from './PageTitle';
import Wizard from '../../modules/guide-mode/react/Wizard';

import CurrentUser from './CurrentUser';
import UserLinks from './UserLinks';

import '../../../styles/app.less';

export default React.createClass({
  propTypes: {
    isError: React.PropTypes.bool,
    isLoading: React.PropTypes.bool
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
        <Header homeUrl={this.state.homeUrl} notifications={this.state.notifications} />
        <FloatingNotifications />
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-3 kbc-sidebar">
              <ProjectSelect
                organizations={this.state.organizations}
                currentProject={this.state.currentProject}
                urlTemplates={this.state.urlTemplates}
                xsrf={this.state.xsrf}
                canCreateProject={this.state.canCreateProject}
                projectTemplates={this.state.projectTemplates}
              />
              <SidebarNavigation />
              <div className="kbc-sidebar-footer">
                <CurrentUser
                  user={this.state.currentAdmin}
                  maintainers={this.state.maintainers}
                  urlTemplates={this.state.urlTemplates}
                  canManageApps={this.state.canManageApps}
                  dropup={true}
                />
                <UserLinks />
              </div>
            </div>
            <div className="col-xs-9 col-xs-offset-3 kbc-main">
              {this.renderMain()}
              {this.state.projectHasGuideModeOn === true && (
                <Wizard
                  projectBaseUrl={this.state.projectBaseUrl}
                  scriptsBasePath={this.state.scriptsBasePath}
                />
              )}
            </div>
          </div>
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
