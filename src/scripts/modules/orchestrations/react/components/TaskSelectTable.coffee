React = require 'react'
createStoreMixin = require('../../../../react/mixins/createStoreMixin')
ComponentsStore = require '../../../components/stores/ComponentsStore'
TaskSelectTableRow = React.createFactory(require './TaskSelectTableRow')
{List} = require 'immutable'

{span} = React.DOM
{input} = React.DOM
{table, thead, tbody} = React.DOM
{strong, th, td, tr} = React.DOM

module.exports = React.createClass
  displayName: 'TaskSelectTable'
  propTypes:
    tasks: React.PropTypes.object.isRequired
    onTaskUpdate: React.PropTypes.func.isRequired

  getInitialState: ->
    components: ComponentsStore.getAll()

  render: ->
    tasks = List()
    @props.tasks.forEach (phase) =>
      tasks = tasks.push(@renderPhaseRow(phase.get('id')))
      tasksRows = phase.get('tasks').map((task) =>
        TaskSelectTableRow
          task: task
          component: @state.components.get(task.get('component'))
          onTaskUpdate: @props.onTaskUpdate
      , @)
      tasks = tasks.concat(tasksRows)

    table className: 'table table-stripped kbc-table-layout-fixed',
      thead null,
        tr null,
          th null, 'Component'
          th style: {width: '22%'}, 'Action'
          th style: {width: '30%'}, 'Parameters'
          th style: {width: '8%'}, 'Active'
      tbody null,
        if tasks.count()
          tasks.toArray()
        else
          tr null,
            td
              colSpan: 4
              className: 'text-muted'
            ,
              'There are no tasks assigned yet.'

  renderPhaseRow: (phaseId) ->
    tr className: 'text-center',
      td colSpan: 4,
        strong null, phaseId
