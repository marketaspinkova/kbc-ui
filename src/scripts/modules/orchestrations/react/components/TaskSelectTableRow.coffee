React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin')
ComponentsStore = require '../../../components/stores/ComponentsStore'
InstalledComponentsStore = require '../../../components/stores/InstalledComponentsStore'

ComponentIcon = require('../../../../react/common/ComponentIcon').default
ComponentName = require('../../../../react/common/ComponentName').default
{Tree, Check} = require '@keboola/indigo-ui'

{span, input} = React.DOM
{table, thead, tbody} = React.DOM
{th, td, tr} = React.DOM

module.exports = React.createClass
  displayName: 'TaskSelectTableRow'
  propTypes:
    job: React.PropTypes.object
    task: React.PropTypes.object.isRequired
    component: React.PropTypes.object
    onTaskUpdate: React.PropTypes.func.isRequired

  render: ->
    tr null,
      td null,
        span className: 'kbc-component-icon',
          if @props.component
            React.createElement ComponentIcon, component: @props.component
          ' '
          if @props.component
            React.createElement ComponentName, component: @props.component
          else
            @props.task.get('componentUrl')
      td null,
        span className: 'label label-info',
          @props.task.get('action')
      td style: {wordBreak: 'break-word'},
        @_renderConfiguration()
      td null,
        input
          type: 'checkbox'
          disabled: false
          checked: @_checkedByStatus()
          onChange: @_handleActiveChange

  _renderConfiguration: ->
    parameters = @props.task.get('actionParameters')
    if parameters.size == 1 && parameters.has('config') && @props.component
      config = InstalledComponentsStore.getConfig(@props.component.get('id'), parameters.get('config'))
      config.get('name', parameters.get('config'))
    else
      React.createElement Tree, data: @props.task.get('actionParameters')

  _handleActiveChange: ->
    @props.onTaskUpdate @props.task.set('active', !@props.task.get('active'))

  _checkedByStatus: ->
    if !!@props.job
      if @props.job.get('status') == "success" || @props.task.get('status') != "success"
        return true
      else
        return false
    else
      return true

