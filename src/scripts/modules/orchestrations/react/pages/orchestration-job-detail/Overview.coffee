React = require 'react'
List = require('immutable').List

JobTasks = React.createFactory(require './JobTasks')
Duration = React.createFactory(require('../../../../../react/common/Duration').default)
JobStatusLabel = React.createFactory(require('../../../../../react/common/JobStatusLabel').default)

date = require '../../../../../utils/date'
{div, h2, small, span, strong} = React.DOM

JobDetailOverview = React.createClass
  displayName: 'JobDetailBody'
  render: ->
    div null,
      div className: 'table kbc-table-border-vertical kbc-detail-table',
        div className: 'tr',
          div className: 'td',
            div className: 'row',
              span className: 'col-md-4', 'Created At '
              strong className: 'col-md-8', date.format(@props.job.get('createdTime'))
            div className: 'row',
              span className: 'col-md-4', 'Start '
              strong className: 'col-md-8', @_getValidStartTime()
          div className: 'td',
            div className: 'row',
              span className: 'col-md-4', 'Status '
              span className: 'col-md-8', JobStatusLabel status: @props.job.get('status')
            div className: 'row',
              span className: 'col-md-4', 'End '
              strong className: 'col-md-8',
                if @props.job.get('endTime')
                  date.format(@props.job.get('endTime'))
                else
                  'N/A'
            div className: 'row',
              span className: 'col-md-4', 'Created By '
              strong className: 'col-md-8', @props.job.getIn(['initiatorToken', 'description'])
      div className: 'kbc-orchestration-tasks-heading',
        h2 null,
          'Tasks',
          @_renderTotalDurationInHeader()
      JobTasks(tasks: @props.job.getIn ['results', 'tasks'], List())

  _renderTotalDurationInHeader: ->
    return '' if !@props.job.get('startTime')
    small className: 'pull-right',
      'Total Duration ',
      Duration
        startTime: @props.job.get('startTime')
        endTime: @props.job.get('endTime')

  _getValidStartTime: ->
    if (@props.job.get('startTime'))
      return date.format(@props.job.get('startTime'))
    else
      return 'N/A'

module.exports = JobDetailOverview
