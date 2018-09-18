React = require 'react'
Modal = React.createFactory(require('react-bootstrap').Modal)
Tooltip = React.createFactory(require('./../../../../react/common/Tooltip').default)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
Button = React.createFactory(require('react-bootstrap').Button)
Panel = React.createFactory(require('react-bootstrap').Panel)
ConfirmButtons = require('../../../../react/common/ConfirmButtons').default
TaskSelectTable = require '../components/TaskSelectTable'
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)

OrchestrationActionCreators = require '../../ActionCreators'

{div, p, strong, i, span} = React.DOM

module.exports = React.createClass
  displayName: 'RunOrchestration'
  propTypes:
    orchestration: React.PropTypes.object.isRequired
    tasks: React.PropTypes.object
    onRequestRun: React.PropTypes.func.isRequired
    onRequestCancel: React.PropTypes.func
    isLoading: React.PropTypes.bool.isRequired
    tooltipPlacement: React.PropTypes.string
    onOpen: React.PropTypes.func

  getInitialState: ->
    showModal: false

  close: ->
    @setState
      showModal: false

  open: ->
    if @props.onOpen
      @props.onOpen()
    @setState
      showModal: true

  render: ->
    span null,
      @renderOpenButton()
      Modal
        show: @state.showModal
        bsSize: 'large'
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'Run orchestration ' + @props.orchestration.get('name')

        ModalBody null,
          p null,
            'You are about to run the orchestration ',
             strong null, @props.orchestration.get('name'),
             ' manually and the notifications will be sent only to you.'
          if @props.tasks
            Panel
              header: 'Choose orchestration tasks to run'
              collapsible: true
            ,
              div className: 'row',
                React.createElement TaskSelectTable,
                  tasks: @props.tasks
                  onTaskUpdate: @_handleTaskUpdate

        ModalFooter null,
          React.createElement ConfirmButtons,
            isSaving: false
            isDisabled: !@_isValid()
            saveLabel: 'Run'
            onCancel: @_handleCancel
            onSave: @_handleRun

  renderOpenButton: ->
    Tooltip
      tooltip: 'Run'
      id: 'run'
      placement: @props.tooltipPlacement
    ,
      Button
        onClick: @_handleOpenButtonClick
        bsStyle: 'link'
      ,
        if @props.isLoading
          Loader className: 'fa-fw'
        else
          i className: 'fa fa-fw fa-play'

  _handleOpenButtonClick: (e) ->
    e.preventDefault()
    e.stopPropagation()
    @open()

  _handleRun: ->
    @close()
    @props.onRequestRun()

  _handleCancel: ->
    if @props.onRequestCancel
      @close()
      @props.onRequestCancel()
    else
      @close()

  _handleTaskUpdate: (updatedTask) ->
    tasks = @props.tasks
    index = tasks.findIndex((task) -> task.get('id') == updatedTask.get('id'))
    tasks = tasks.map (phase) ->
      newTasks = phase.get('tasks').map (t) ->
        if t.get('id') == updatedTask.get('id')
          return updatedTask
        else
          return t
      return phase.set('tasks', newTasks)

    OrchestrationActionCreators.updateOrchestrationRunTasksEdit(
      @props.orchestration.get('id')
      tasks
    )

  _isValid: ->
    if (@props.tasks == undefined)
      return true
    allTasks = @props.tasks
    if allTasks?
      allTasks.filter((tasks) ->
        tasks.get('tasks').filter((task) ->
          task.get('active')
        ).count() > 0
      ).count() > 0
