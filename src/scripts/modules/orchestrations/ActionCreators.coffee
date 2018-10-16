_ = require 'underscore'
{List} = require 'immutable'
dispatcher = require '../../Dispatcher'
constants = require './Constants'
orchestrationsApi = require './OrchestrationsApi'
jobsApi = require '../jobs/JobsApi'
OrchestrationStore = require('./stores/OrchestrationsStore').default
OrchestrationJobsStore = require('./stores/OrchestrationJobsStore').default
Promise = require 'bluebird'
ApplicationActionCreators = require '../../actions/ApplicationActionCreators'
VersionsActionCreators = require '../components/VersionsActionCreators'

React = require 'react'
{Link} = require 'react-router'
RoutesStore = require '../../stores/RoutesStore'

rephaseTasks = (tasks) ->
  isNullPhase = (phase) ->
    return phase == null or phase == 0 or phase == undefined
  nullPhaseIdx = 1
  currentPhase =
    id: null
  result = []
  for task in tasks
    phase = task.phase
    if isNullPhase(phase) or phase.toString() != currentPhase.id
      newPhaseId = phase
      if isNullPhase(phase)
        newPhaseId = "Phase #{nullPhaseIdx}"
        nullPhaseIdx++
      #create new phase
      newPhase =
        id: "#{newPhaseId}"
        tasks: [task]
      currentPhase = newPhase
      result.push(newPhase)
    else
      currentPhase.tasks.push(task)
  #return tasks
  return result

dephaseTasks = (tasks) ->
  result = List()
  tasks.forEach (phase) ->
    phaseId = phase.get('id')
    phase.get('tasks').forEach (task) ->
      result = result.push(task.set('phase', phaseId))
  return result

module.exports =
  rephaseTasks: (tasks) ->
    rephaseTasks(tasks)
  dephaseTasks: (tasks) ->
    dephaseTasks(tasks)
  ###
    Request orchestrations reload from server
  ###
  loadOrchestrationsForce: ->
    actions = @

    # trigger load initialized
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATIONS_LOAD
    )

    # init load
    orchestrationsApi
    .getOrchestrations()
    .then((orchestrations) ->
      # load success
      actions.receiveAllOrchestrations(orchestrations)
    )
    .catch (err) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATIONS_LOAD_ERROR
      )
      throw err

  receiveAllOrchestrations: (orchestrations) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATIONS_LOAD_SUCCESS
      orchestrations: orchestrations
    )

  ###
    Request orchestrations load only if not alread loaded
    @return Promise
  ###
  loadOrchestrations: ->
    # don't load if already loaded
    return Promise.resolve() if OrchestrationStore.getIsLoaded()

    @loadOrchestrationsForce()

  ###
    Request specified orchestration load from server
    @return Promise
  ###
  loadOrchestrationForce: (id) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_LOAD
      orchestrationId: id
    )

    VersionsActionCreators.loadVersionsForce 'orchestrator', id.toString()

    orchestrationsApi
    .getOrchestration(id)
    .then @receiveOrchestration
    .catch((error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_LOAD_ERROR
      )
      throw error
    )

  receiveOrchestration: (orchestration) ->
    orchestration.tasks = rephaseTasks(orchestration.tasks)
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_LOAD_SUCCESS
      orchestration: orchestration
    )

  loadOrchestration: (id) ->
    return Promise.resolve() if OrchestrationStore.has(id) && OrchestrationStore.hasOrchestrationTasks(id)
    @loadOrchestrationForce(id)


  deleteOrchestration: (id) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_DELETE_START
      orchestrationId: id

    orchestration = OrchestrationStore.get id

    orchestrationsApi
    .deleteOrchestration(id)
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_DELETE_SUCCESS
        orchestrationId: id

      ApplicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "Orchestration #{orchestration.get('name')} was moved to "
              React.createElement Link,
                to: 'settings-trash'
                onClick: @props.onClick
              ,
                'Trash'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_DELETE_ERROR
        orchestrationId: id
      throw e

  createOrchestration: (data) ->

    orchestrationsApi
    .createOrchestration(data)
    .then((newOrchestration) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_CREATE_SUCCESS
        orchestration: newOrchestration
      )
      RoutesStore.getRouter().transitionTo 'orchestration',
        orchestrationId: newOrchestration.id
    )




  ###
    Load specifed orchestration jobs from server
  ###
  loadOrchestrationJobsForce: (orchestrationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD
      orchestrationId: orchestrationId
    )

    orchestrationsApi
    .getOrchestrationJobs(orchestrationId)
    .then((jobs) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD_SUCCESS
        orchestrationId: orchestrationId
        jobs: jobs
      )
    )
    .catch((error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD_ERROR
        orchestrationId: orchestrationId
      )
      throw error
    )

  loadOrchestrationJobs: (orchestrationId) ->
    return Promise.resolve() if OrchestrationJobsStore.hasOrchestrationJobs(orchestrationId)
    @loadOrchestrationJobsForce(orchestrationId)

  ###
    Fetch single job from server
  ###
  loadJobForce: (jobId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD
      jobId: jobId
    )

    orchestrationsApi
    .getJob(jobId)
    .then((job) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS
        orchestrationId: job.orchestrationId
        job: job
      )
    )

  ###
    Ensure that job is loaded, cached version is accpeted
  ###
  loadJob: (jobId) ->
    return Promise.resolve() if OrchestrationJobsStore.getJob(jobId)
    @loadJobForce jobId

  ###
    Filter orchestrations
  ###
  setOrchestrationsFilter: (query) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATIONS_SET_FILTER
      query: query
    )

  activateOrchestration: (id) ->
    @changeActiveState(id, true)

  disableOrchestration: (id) ->
    @changeActiveState(id, false)

  changeActiveState: (orchestrationId, active) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_START
      active: active
      orchestrationId: orchestrationId
    )

    orchestrationsApi.updateOrchestration(orchestrationId,
      active: active
    )
    .then (response) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_SUCCESS
        active: response.active
        orchestrationId: orchestrationId
      )

      VersionsActionCreators.loadVersionsForce 'orchestrator', orchestrationId.toString()
    .catch (e) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_ERROR
        active: active
        orchestrationId: orchestrationId
      )
      throw e

  ###
    Editing orchestration field
  ###
  startOrchestrationFieldEdit: (orchestrationId, fieldName) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_START
      orchestrationId: orchestrationId
      field: fieldName

  cancelOrchestrationFieldEdit: (orchestrationId, fieldName) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_CANCEL
      orchestrationId: orchestrationId
      field: fieldName

  updateOrchestrationFieldEdit: (orchestrationId, fieldName, newValue) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_UPDATE
      orchestrationId: orchestrationId
      field: fieldName
      value: newValue

  saveOrchestrationField: (orchestrationId, fieldName) ->
    value = OrchestrationStore.getEditingValue orchestrationId, fieldName

    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_START
      orchestrationId: orchestrationId
      field: fieldName

    data = {}
    data[fieldName] = value

    orchestrationsApi
    .updateOrchestration orchestrationId, data
    .then (orchestration) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_SUCCESS
        orchestrationId: orchestrationId
        field: fieldName
        orchestration: orchestration
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_ERROR
        orchestrationId: orchestrationId
        field: fieldName
        error: e
      throw e


  ###
    Editing orchestration tasks
  ###
  startOrchestrationTasksEdit: (orchestrationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_START
      orchestrationId: orchestrationId
    )

  cancelOrchestrationTasksEdit: (orchestrationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_CANCEL
      orchestrationId: orchestrationId
    )

  updateOrchestrationsTasksEdit: (orchestrationId, tasks) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_UPDATE
      orchestrationId: orchestrationId
      tasks: tasks
    )

  saveOrchestrationTasks: (orchestrationId) ->
    tasks = OrchestrationStore.getEditingValue(orchestrationId, 'tasks')
    tasks = dephaseTasks(tasks)
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_START
      orchestrationId: orchestrationId
    )

    orchestrationsApi
    .saveOrchestrationTasks(orchestrationId, tasks.toJS())
    .then((tasks) ->
      # update tasks from server
      tasks = rephaseTasks(tasks)
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_SUCCESS
        orchestrationId: orchestrationId
        tasks: tasks
      )
    )
    .catch (e) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_ERROR
        orchestrationId: orchestrationId
        error: e
      )
      throw e


  ###
    Editing tasks on job retry
  ###
  startJobRetryTasksEdit: (jobId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_START
      jobId: jobId
    )

  updateJobRetryTasksEdit: (jobId, tasks) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_UPDATE
      jobId: jobId
      tasks: tasks
    )

  ###
    Editing tasks on manulal run
  ###
  startOrchestrationRunTasksEdit: (orchestrationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_START
      orchestrationId: orchestrationId
    )

  cancelOrchestrationRunTasksEdit: (orchestrationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_CANCEL
      orchestrationId: orchestrationId
    )

  updateOrchestrationRunTasksEdit: (orchestrationId, tasks) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_UPDATE
      orchestrationId: orchestrationId
      tasks: tasks
    )

  ###
    Editing notifications
  ###
  startOrchestrationNotificationsEdit: (id) ->
    @startOrchestrationFieldEdit id, 'notifications'

  cancelOrchestrationNotificationsEdit: (id) ->
    @cancelOrchestrationFieldEdit id, 'notifications'

  updateOrchestrationNotificationsEdit: (id, newNotifications) ->
    @updateOrchestrationFieldEdit id, 'notifications', newNotifications

  saveOrchestrationNotificationsEdit: (id) ->
    notifications = OrchestrationStore.getEditingValue(id, 'notifications')

    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_START
      orchestrationId: id
      field: 'notifications'

    orchestrationsApi
    .saveOrchestrtionNotifications id, notifications.toJS()
    .then (notifications) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_SUCCESS
        orchestrationId: id
        field: 'notifications'
        notifications: notifications
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_ERROR
        orchestrationId: id
        field: 'notifications'
        error: e
      throw e

  ###
    Run and termination
  ###

  runOrchestration: (id, tasks, notify = false) ->
    data = {}
    if tasks
      data = {tasks: dephaseTasks(tasks)}

    orchestrationsApi
    .runOrchestration(
      id
      data
    )
    .then((newJob) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS
        orchestrationId: newJob.orchestrationId
        job: newJob
      )
      if tasks
        dispatcher.handleViewAction(
          type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_SUCCESS
          orchestrationId: newJob.orchestrationId
        )
      if notify
        ApplicationActionCreators.sendNotification
          message: React.createClass
            render: ->
              React.DOM.span null,
                React.createElement Link,
                  to: 'orchestrationJob'
                  params:
                    jobId: newJob.id
                    orchestrationId: id
                  onClick: @props.onClick
                ,
                  'Orchestrator job',
                ' has been scheduled'
    )

  terminateJob: (jobId) ->
    actions = @
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_START
      jobId: jobId

    jobsApi
    .terminateJob jobId
    .then (response) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_SUCCESS
        jobId: jobId
      actions.loadJobForce jobId
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_ERROR
        jobId: jobId
      throw e

  retryOrchestrationJob: (jobId, orchestrationId, notify = false) ->
    tasks = OrchestrationJobsStore.getEditingValue(jobId, 'tasks')

    actions = @
    dispatcher.handleViewAction
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_START
      jobId: jobId

    orchestrationsApi
    .retryJob(
      jobId
      tasks
    )
    .then (newJob) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_SUCCESS
        jobId: jobId
        job: newJob
      actions.loadOrchestrationJobsForce orchestrationId
      if notify
        ApplicationActionCreators.sendNotification
          message: React.createClass
            render: ->
              React.DOM.span null,
                "Orchestration scheduled. You can track the progress "
                React.createElement Link,
                  to: 'orchestrationJob'
                  params:
                    jobId: newJob.id
                    orchestrationId: orchestrationId
                  onClick: @props.onClick
                ,
                  'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_ERROR
        jobId: jobId
      throw e
