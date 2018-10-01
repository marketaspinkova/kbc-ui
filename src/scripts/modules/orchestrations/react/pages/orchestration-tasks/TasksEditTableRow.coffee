React = require 'react'
Immutable = require 'immutable'
_ = require 'underscore'

ComponentConfigurationLink = require '../../../../components/react/components/ComponentConfigurationLink'

TaskParametersEditModal = React.createFactory(require('../../modals/TaskParametersEdit').default)
ComponentIcon = React.createFactory(require('../../../../../react/common/ComponentIcon').default)
ComponentName = React.createFactory(require('../../../../../react/common/ComponentName').default)
Tree = React.createFactory(require('@keboola/indigo-ui').Tree)
Tooltip = React.createFactory(require('../../../../../react/common/Tooltip').default)

{small, button, tr, td, span, div, i, input} = React.DOM

TasksEditTableRow = React.createClass
  displayName: 'TasksEditTableRow'
  propTypes:
    task: React.PropTypes.object.isRequired
    component: React.PropTypes.object
    disabled: React.PropTypes.bool.isRequired
    onTaskDelete: React.PropTypes.func.isRequired
    onTaskUpdate: React.PropTypes.func.isRequired
    toggleMarkTask: React.PropTypes.func.isRequired
    isMarked: React.PropTypes.bool.isRequired
    color: React.PropTypes.string

  render: ->
    tr {style: {'backgroundColor': @props.color}},
      td className: 'kb-orchestrator-task-drasg',
        Tooltip
          tooltip: 'Select task to move between phases'
          input
            type: 'checkbox'
            checked: @props.isMarked
            onClick: =>
              @props.toggleMarkTask(@props.task.get('id'))
      td null,
        span className: 'kbc-component-icon',
          if @props.component
            ComponentIcon component: @props.component
          else
            ' '

        if @props.component
          ComponentName component: @props.component
        else
          @props.task.get('componentUrl')
      td null,
        if @props.task.has 'config'
          React.createElement ComponentConfigurationLink,
            componentId: @props.task.get 'component'
            configId: @props.task.getIn ['config', 'id']
          ,
            @props.task.getIn ['config', 'name']
            div className: 'help-block',
              small null, @props.task.getIn ['config', 'description']

        else
          'N/A'
      td null,
        div className: 'form-group form-group-sm',
          input
            className: 'form-control'
            type: 'text'
            defaultValue: @props.task.get('action')
            disabled: @props.disabled
            onChange: @_handleActionChange
      td null,
        input
          type: 'checkbox'
          disabled: @props.disabled
          checked: @props.task.get('active')
          onChange: @_handleActiveChange
      td null,
        input
          type: 'checkbox'
          disabled: @props.disabled
          checked: @props.task.get('continueOnFailure')
          onChange: @_handleContinueOnFailureChange
      @_renderActionButtons()


  _renderActionButtons: ->
    td className: 'text-right kbc-no-wrap',
      div className: '',

        TaskParametersEditModal
          onSet: @_handleParametersChange
          parameters: @props.task.get('actionParameters').toJS()

        button
          style: {padding: '2px'}
          onClick: @_handleDelete
          className: 'btn btn-link'
        ,
          Tooltip
            placement: 'top'
            tooltip: 'Remove task'
            span className: 'kbc-icon-cup'

  _handleParametersChange: (parameters) ->
    @props.onTaskUpdate @props.task.set('actionParameters', Immutable.fromJS(parameters))

  _handleActionChange: (event) ->
    @props.onTaskUpdate @props.task.set('action', event.target.value.trim())

  _handleActiveChange: ->
    @props.onTaskUpdate @props.task.set('active', !@props.task.get('active'))

  _handleContinueOnFailureChange: ->
    @props.onTaskUpdate @props.task.set('continueOnFailure', !@props.task.get('continueOnFailure'))

  _handleDelete: ->
    @props.onTaskDelete(@props.task.get('id'))


module.exports = TasksEditTableRow
