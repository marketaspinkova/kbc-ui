React = require 'react'

TaskSelectTable = require '../components/TaskSelectTable'

Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
Button = React.createFactory(require('react-bootstrap').Button)
{Panel} = require('react-bootstrap')
{div, p, span, i, input, label} = React.DOM

Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
Panel  = React.createFactory Panel
ConfirmButtons = require('../../../../react/common/ConfirmButtons').default

OrchestrationsApi = require('../../OrchestrationsApi')

module.exports = React.createClass
  displayName: 'TaskSelect'
  propTypes:
    job: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    onRun: React.PropTypes.func.isRequired
    onOpen: React.PropTypes.func.isRequired
    isSaving: React.PropTypes.bool.isRequired

  getInitialState: ->
    showModal: false

  close: ->
    @setState
      showModal: false

  open: ->
    @props.onOpen()
    @setState
      showModal: true

  render: ->
    tasks = @props.tasks

    span null,
      @renderOpenButton()
      Modal
        show: @state.showModal
        bsSize: 'large'
        keyboard: false
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'Retry job'

        ModalBody null,
          p null,
            'You are about to run orchestration again'
          ,
          React.createElement TaskSelectTable,
            job: @props.job
            tasks: tasks
            onTaskUpdate: @_handleTaskUpdate

        ModalFooter null,
          div null,
            div className: 'col-sm-6'
            div className: 'col-sm-6',
              React.createElement ConfirmButtons,
                isSaving: false
                isDisabled: !@_isValid()
                saveLabel: 'Run'
                onCancel: @close
                onSave: @_handleRun

  renderOpenButton: ->
    Button
      onClick: @open
      bsStyle: 'link'
    ,
      if @props.isSaving
        Loader null
      else
        i className: 'fa fa-play'
      ' Job retry'

  _handleRun: (e) ->
    @props.onRun()
    @close()

  _handleTaskUpdate: (updatedTask) ->
    @props.onChange(updatedTask)

  _isValid: (e) ->
    @props.tasks.filter((tasks) ->
      tasks.get('tasks').filter((task) ->
        task.get('active')
      ).count() > 0
    ).count() > 0
