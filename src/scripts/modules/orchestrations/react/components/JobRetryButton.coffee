React = require 'react'
{List, fromJS} = require 'immutable'
createStoreMixin = require('../../../../react/mixins/createStoreMixin')
JobsStore = require('../../stores/OrchestrationJobsStore').default
ActionCreators = require('../../ActionCreators')
{dephaseTasks, rephaseTasks} = ActionCreators

RoutesStore = require('../../../../stores/RoutesStore')
TaskSelectTable = React.createFactory(require './TaskSelectTable')
Confirm = React.createFactory(require '../../../../react/common/Confirm')
TasksTable = React.createFactory(require('../pages/orchestration-tasks/TasksTable').default)
TasksTableRow = React.createFactory(require('../pages/orchestration-tasks/TasksTableRow').default)
ComponentsStore = require '../../../components/stores/ComponentsStore'
JobActionCreators = require '../../ActionCreators'

TaskSelectModal = React.createFactory(require('../modals/TaskSelect').default)

module.exports = React.createClass
  displayName: 'JobRetryButton'
  mixins: [createStoreMixin(JobsStore)]
  propTypes:
    job: React.PropTypes.object.isRequired
    isSaving: React.PropTypes.bool.isRequired
    notify: React.PropTypes.bool

  getDefaultProps: ->
    tooltipPlacement: 'top'

  _getJobId: ->
    RoutesStore.getCurrentRouteIntParam 'jobId'

  getInitialState: ->
    components: ComponentsStore.getAll()
    isSaving: false

  getStateFromStores: ->
    jobId = @_getJobId()
    job: JobsStore.getJob jobId

  _handleRun: ->
    ActionCreators.retryOrchestrationJob(
      @state.job.get('id')
      @state.job.get('orchestrationId')
      @props.notify
    )

  _canBeRetried: ->
    status = @state.job.get('status')
    status is 'success' ||
      status is 'error' ||
      status is 'cancelled' ||
      status is 'canceled' ||
      status is 'terminated' ||
        status is 'warning' ||
          status is 'warn'

  render: ->
    tasks = @state.job.get('tasks')
    if @_canBeRetried() && tasks
      editingTasks = JobsStore.getEditingValue(@props.job.get('id'), 'tasks') or List()
      TaskSelectModal
        tasks: fromJS(rephaseTasks(editingTasks.toJS()))
        onChange: @_handleTaskChange
        onRun: @_handleRun
        onOpen: @_handleRetrySelectStart
        isSaving: @props.isSaving

    else
      null

  reactivateJobTasks: ->
    enabledTaskStatuses = @props.job.getIn(['results', 'tasks'], List()).filter((task) -> task.get('active'))
    jobSucceeded = @props.job.get('status') == 'success'
    failedPhaseId = null
    enabledTaskStatuses.forEach((task) =>
      isTaskFailed = task.get('status') != 'success'
      if (isTaskFailed and !failedPhaseId)
        failedPhaseId = task.get('phase')
      previouslyFailed = failedPhaseId and failedPhaseId != task.get('phase')
      @_handleTaskChange(task.set('active', jobSucceeded or isTaskFailed or previouslyFailed))
    )

  _handleRetrySelectStart: ->
    JobActionCreators.startJobRetryTasksEdit(@state.job.get('id'))
    @reactivateJobTasks()

  _handleTaskChange: (updatedTask) ->
    tasks = JobsStore.getEditingValue(@props.job.get('id'), 'tasks')
    if tasks
      index = tasks.findIndex((task) -> task.get('id') == updatedTask.get('id'))
      JobActionCreators.updateJobRetryTasksEdit(
        @props.job.get('id')
        tasks.set(index, tasks.get(index).set('active', updatedTask.get('active')))
      )
