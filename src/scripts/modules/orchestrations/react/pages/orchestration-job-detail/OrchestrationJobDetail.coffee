React = require 'react'
{fromJS, List} = require('immutable')
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'

# actions and stores
OrchestrationsActionCreators = require '../../../ActionCreators'
{dephaseTasks, rephaseTasks} = OrchestrationsActionCreators

OrchestrationStore = require('../../../stores/OrchestrationsStore').default
OrchestrationJobsStore = require('../../../stores/OrchestrationJobsStore').default
RoutesStore = require '../../../../../stores/RoutesStore'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'

mergeTasksWithConfigurations = require('../../../mergeTasksWithConfigruations').default

# components
JobsNav = React.createFactory(require './JobsNav')
JobOverview = React.createFactory(require './Overview')
Events =  React.createFactory(require('../../../../sapi-events/react/Events').default)

Tabs = React.createFactory(require('react-bootstrap').Tabs)
Tab = React.createFactory(require('react-bootstrap').Tab)

{div} = React.DOM

OrchestrationJobDetail = React.createClass
  displayName: 'OrchestrationJobDetail'
  mixins: [createStoreMixin(OrchestrationStore, OrchestrationJobsStore, InstalledComponentsStore)]

  getStateFromStores: ->
    orchestrationId = RoutesStore.getCurrentRouteIntParam 'orchestrationId'
    jobId = RoutesStore.getCurrentRouteIntParam 'jobId'
    job = OrchestrationJobsStore.getJob(jobId)
    if job.hasIn ['results', 'tasks']
      phasedTasks = rephaseTasks(job.getIn(['results', 'tasks'], List()).toJS())
      merged = mergeTasksWithConfigurations( fromJS(phasedTasks),
        InstalledComponentsStore.getAll())

      job = job.setIn(['results', 'tasks'], dephaseTasks(merged))

    return {
      orchestrationId: orchestrationId
      job: job
      isLoading: OrchestrationJobsStore.isJobLoading jobId
      jobs: OrchestrationJobsStore.getOrchestrationJobs orchestrationId
      jobsLoading: OrchestrationJobsStore.isLoading orchestrationId
      openedTab: if RoutesStore.getRouterState().hasIn(['query', 'eventId']) then 'log' else 'overview'
    }

  componentDidMount: ->
    OrchestrationsActionCreators.loadOrchestrationJobs(@state.job.get 'orchestrationId')

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())
    OrchestrationsActionCreators.loadOrchestrationJobs(@state.job.get 'orchestrationId')

  render: ->
    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        div {className: 'row kbc-row-orchestration-detail'},
          div {className: 'col-md-3 kb-orchestrations-sidebar kbc-main-nav'},
            div {className: 'kbc-container'},
              JobsNav
                jobs: @state.jobs
                jobsLoading: @state.jobsLoading
                activeJobId: @state.job.get 'id'
          div {className: 'col-md-9 kb-orchestrations-main kbc-main-content-with-nav'},
            div {},
              Tabs
                defaultActiveKey: @state.openedTab
                animation: false
                id: 'orchestration-job-detail-tabs',
                  Tab eventKey: 'overview', title: 'Overview', className: 'tab-pane-no-padding',
                    JobOverview(job: @state.job)
                  Tab eventKey: 'log', title: 'Log', className: 'tab-pane-no-padding orchestration-job-detail-tabs',
                    Events
                      link:
                        to: 'orchestrationJob'
                        params:
                          orchestrationId: @state.orchestrationId
                          jobId: @state.job.get('id')
                      params:
                        runId: @state.job.get('runId')
                      autoReload: @state.job.get('status') == 'waiting' ||  @state.job.get('status') == 'processing'



module.exports = OrchestrationJobDetail
