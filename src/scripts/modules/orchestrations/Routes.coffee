###
  Orchestrations module routing
###

React = require 'react'

# pages and components
OrchestrationsIndex = require('./react/pages/orchestrations-index/OrchestrationsIndex').default
OrchestrationDetail = require('./react/pages/orchestration-detail/OrchestrationDetail').default
OrchestrationJobDetail = require('./react/pages/orchestration-job-detail/OrchestrationJobDetail').default
OrchestrationTasks = require('./react/pages/orchestration-tasks/OrchestrationTasks').default
OrchestrationNotifications = require('./react/pages/orchestration-notifications/OrchestrationNotifications').default

OrchestrationsReloaderButton = require './react/components/OrchestrationsReloaderButton'
NewOrchestrationHeaderButton = require './react/components/NewOrchestionHeaderButton'
OrchestrationReloaderButton = require './react/components/OrchestrationReloaderButton'
JobReloaderButton = require('./react/components/JobReloaderButton').default
JobDetailButtons = require('./react/components/JobDetailButtons').default
OrchestrationDetailButtons = require './react/components/OrchestrationDetailButtons'
OrchestrationTasksButtons = require './react/components/OrchestrationTasksButtons'
OrchestrationNotificationsButtons = require './react/components/OrchestrationNotificationsButtons'
OrchestrationNameEdit = require './react/components/OrchestrationNameEdit'

# stores
OrchestrationsStore = require('./stores/OrchestrationsStore').default

OrchestrationsActionCreators = require './ActionCreators'
InstalledComponentsActionsCreators = require '../components/InstalledComponentsActionCreators'
VersionsActionCreators = require '../components/VersionsActionCreators'

createVersionsPageRoute = require('../../modules/components/utils/createVersionsPageRoute').default

routes =
  name: 'orchestrations'
  title: 'Orchestrations'
  defaultRouteHandler: OrchestrationsIndex
  reloaderHandler: OrchestrationsReloaderButton
  headerButtonsHandler: NewOrchestrationHeaderButton
  poll:
    interval: 10
    action: ->
      OrchestrationsActionCreators.loadOrchestrationsForce()
  requireData: [
      -> OrchestrationsActionCreators.loadOrchestrations()
    ,
      -> InstalledComponentsActionsCreators.loadComponents()
    ]
  childRoutes: [
    name: 'orchestration'
    nameEdit: (params) ->
      React.createElement OrchestrationNameEdit,
        orchestrationId: parseInt params.orchestrationId
    path: ':orchestrationId'
    reloaderHandler: OrchestrationReloaderButton
    headerButtonsHandler: OrchestrationDetailButtons
    defaultRouteHandler: OrchestrationDetail
    poll:
      interval: 20
      action: (params) ->
        OrchestrationsActionCreators.loadOrchestrationJobsForce(parseInt(params.orchestrationId))
    requireData: [
        (params) ->
          OrchestrationsActionCreators.loadOrchestration(parseInt(params.orchestrationId))
      ,
        (params) ->
          OrchestrationsActionCreators.loadOrchestrationJobs(parseInt(params.orchestrationId))
      ,
        (params) ->
          VersionsActionCreators.loadVersions('orchestrator', params.orchestrationId)
    ]
    title: (routerState) ->
      orchestrationId = parseInt(routerState.getIn ['params', 'orchestrationId'])
      OrchestrationsStore.get(orchestrationId).get 'name'

    childRoutes: [
      name: 'orchestrationJob'
      reloaderHandler: JobReloaderButton
      poll:
        interval: 10
        action: (params) ->
          OrchestrationsActionCreators.loadJobForce(parseInt(params.jobId))
      requireData: (params) ->
        OrchestrationsActionCreators.loadJob(parseInt(params.jobId))
      title: (routerState) ->
        'Job ' +  routerState.getIn ['params', 'jobId']
      path: 'jobs/:jobId'
      handler: OrchestrationJobDetail
      headerButtonsHandler: JobDetailButtons
    ,
      name: 'orchestrationTasks'
      title: 'Tasks'
      path: 'tasks'
      handler: OrchestrationTasks
      headerButtonsHandler: OrchestrationTasksButtons
    ,
      name: 'orchestrationNotifications'
      title: 'Notifications'
      path: 'notifications'
      handler: OrchestrationNotifications
      headerButtonsHandler: OrchestrationNotificationsButtons
    ,
      createVersionsPageRoute('orchestrator', 'orchestrationId', null, {readOnlyMode: true})
    ]
  ]

module.exports = routes
