React = require 'react'
Immutable = require 'immutable'
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'

# actions and stores
OrchestrationsActionCreators = require '../../../ActionCreators'
installedComponentsActions = require '../../../../components/InstalledComponentsActionCreators'

OrchestrationStore = require('../../../stores/OrchestrationsStore').default
ComponentsStore = require '../../../../components/stores/ComponentsStore'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
RoutesStore = require '../../../../../stores/RoutesStore'
ApplicationStore = require '../../../../../stores/ApplicationStore'

mergeTasksWithConfigurations = require('../../../mergeTasksWithConfigruations').default

# React components
OrchestrationsNav = React.createFactory(require './../orchestration-detail/OrchestrationsNav')
SearchBar = React.createFactory(require('@keboola/indigo-ui').SearchBar)
TasksTable = React.createFactory(require './TasksTable')
TasksEditor = React.createFactory(require './TasksEditor')

HTML5Backend = require 'react-dnd-html5-backend'
DragDropContext = require('react-dnd').DragDropContext

{div, button} = React.DOM

componentId = 'orchestrations'

OrchestrationTasks = React.createClass
  displayName: 'OrchestrationTasks'
  mixins: [createStoreMixin(OrchestrationStore, ComponentsStore, InstalledComponentsStore)]

  getStateFromStores: ->
    orchestrationId = RoutesStore.getCurrentRouteIntParam 'orchestrationId'
    localState = InstalledComponentsStore.getLocalState(componentId, orchestrationId)

    isEditing = OrchestrationStore.isEditing(orchestrationId, 'tasks')
    if isEditing
      tasks = OrchestrationStore.getEditingValue(orchestrationId, 'tasks')
    else
      tasks = OrchestrationStore.getOrchestrationTasks(orchestrationId)
    tasksWithConfig = mergeTasksWithConfigurations(tasks, InstalledComponentsStore.getAll())
    return {
      localState: localState or Immutable.Map()
      orchestrationId: orchestrationId
      orchestration: OrchestrationStore.get orchestrationId
      tasks: tasksWithConfig
      components: ComponentsStore.getAll()
      filter: OrchestrationStore.getFilter()
      isEditing: isEditing
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'tasks')
      filteredOrchestrations: OrchestrationStore.getFiltered()
    }

  componentDidMount: ->
    # start edit if orchestration is empty
    if !@state.isEditing && @state.tasks.count() == 0
      OrchestrationsActionCreators.startOrchestrationTasksEdit(@state.orchestration.get('id'))

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  _handleFilterChange: (query) ->
    OrchestrationsActionCreators.setOrchestrationsFilter(query)

  _handleTasksChange: (newTasks) ->
    OrchestrationsActionCreators.updateOrchestrationsTasksEdit(@state.orchestration.get('id'), newTasks)

  _handleTaskRun: (task) ->
    if @state.tasks.count()
      tasks = @state.tasks.map((phase) ->
        phase.set('tasks', phase.get('tasks').map((item) ->
          if item.get('id') == task.get('id')
            item.set('active', true)
          else
            item.set('active', false)
        ))
      )
    else
      tasks = Immutable.List()

    OrchestrationsActionCreators.runOrchestration(@state.orchestration.get('id'), tasks, true)


  render: ->
    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        div {className: 'row kbc-row-orchestration-detail'},
          div {className: 'col-md-3 kb-orchestrations-sidebar kbc-main-nav'},
            div {className: 'kbc-container'},
              div {className: 'layout-master-detail-search'},
                SearchBar(onChange: @_handleFilterChange, query: @state.filter)
              OrchestrationsNav
                orchestrations: @state.filteredOrchestrations
                activeOrchestrationId: @state.orchestration.get 'id'
          div {className: 'col-md-9 kb-orchestrations-main kbc-main-content-with-nav'},
            if @state.isEditing
              div null,
                TasksEditor
                  tasks: @state.tasks
                  isSaving: @state.isSaving
                  components: @state.components
                  onChange: @_handleTasksChange
                  localState: @state.localState.get('taskstable', Immutable.Map())
                  updateLocalState: (path, data) =>
                    @updateLocalState(['taskstable'].concat(path), data)
            else
              div null,
                TasksTable
                  tasks: @state.tasks
                  orchestration: @state.orchestration
                  components: @state.components
                  onRun: @_handleTaskRun
                  localState: @state.localState.get('taskstable', Immutable.Map())
                  updateLocalState: (path, data) =>
                    @updateLocalState(['taskstable'].concat(path), data)


  updateLocalState: (path, data) ->
    newState = @state.localState.setIn([].concat(path), data)
    installedComponentsActions.updateLocalState(componentId, @state.orchestrationId, newState, path)


module.exports = DragDropContext(HTML5Backend)(OrchestrationTasks)
