React = require 'react'
RouteHandler = React.createFactory(require('react-router').RouteHandler)
ApplicationStore = require '../../stores/ApplicationStore'

Header = React.createFactory(require '././Header')
SidebarNavigation = React.createFactory(require('././SidebarNavigation').default)
FloatingNotifications = require('./FloatingNotifications').default
ErrorPage = React.createFactory(require('./../pages/ErrorPage').default)
LoadingPage = React.createFactory(require('./../pages/LoadingPage').default)
ProjectSelect = React.createFactory(require('./project-select/ProjectSelect').default)
PageTitle = React.createFactory(require './PageTitle')
Wizard =  React.createFactory(require('../../modules/guide-mode/react/Wizard').default)
WizardStore = require('../../modules/guide-mode/stores/WizardStore').default
DisableGuideMode = require('../../modules/guide-mode/stores/ActionCreators').disableGuideMode

CurrentUser = React.createFactory(require('./CurrentUser').default)
UserLinks = React.createFactory(require('./UserLinks').default)
classnames = require('classnames')

{div, a, i, p} = React.DOM

require '../../../styles/app.less'

App = React.createClass
  displayName: 'App'
  propTypes:
    isError: React.PropTypes.bool
    isLoading: React.PropTypes.bool
  getInitialState: ->
    organizations: ApplicationStore.getOrganizations()
    maintainers: ApplicationStore.getMaintainers()
    notifications: ApplicationStore.getNotifications()
    currentProject: ApplicationStore.getCurrentProject()
    currentAdmin: ApplicationStore.getCurrentAdmin()
    urlTemplates: ApplicationStore.getUrlTemplates()
    projectTemplates: ApplicationStore.getProjectTemplates()
    xsrf: ApplicationStore.getXsrfToken()
    canCreateProject: ApplicationStore.getCanCreateProject()
    canManageApps: ApplicationStore.getKbcVars().get 'canManageApps'
    projectHasGuideModeOn: ApplicationStore.getKbcVars().get 'projectHasGuideModeOn'
    homeUrl: ApplicationStore.getUrlTemplates().get 'home'
    projectFeatures: ApplicationStore.getCurrentProjectFeatures()
    projectBaseUrl: ApplicationStore.getProjectBaseUrl()
    scriptsBasePath: ApplicationStore.getScriptsBasePath()
  render: ->
    div null,
      if @state.projectHasGuideModeOn == true
        div className: 'guide-status-bar',
          p null,
            'Guide Mode '
          p null,
            '\xa0- learn everything you need to know about Keboola Connection'
      PageTitle()
      Header
        homeUrl: @state.homeUrl
        notifications: @state.notifications
      React.createElement(FloatingNotifications)
      div className: 'container-fluid',
        div className: 'row',
          div className: 'col-xs-3 kbc-sidebar',
            ProjectSelect
              organizations: @state.organizations
              currentProject: @state.currentProject
              urlTemplates: @state.urlTemplates
              xsrf: @state.xsrf
              canCreateProject: @state.canCreateProject
              projectTemplates: @state.projectTemplates
            SidebarNavigation()
            div className: 'kbc-sidebar-footer',
              CurrentUser
                user: @state.currentAdmin
                maintainers: @state.maintainers
                urlTemplates: @state.urlTemplates
                canManageApps: @state.canManageApps
                dropup: true
              UserLinks()
          div className: 'col-xs-9 col-xs-offset-3 kbc-main',
            if @props.isError
              ErrorPage()
            else if @props.isLoading
              LoadingPage()
            else
              RouteHandler()
            if @state.projectHasGuideModeOn == true
              Wizard
                projectBaseUrl: @state.projectBaseUrl
                scriptsBasePath: @state.scriptsBasePath

module.exports = App
