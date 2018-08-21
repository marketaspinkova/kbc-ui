React = require 'react'
_ = require 'underscore'
moment = require 'moment'
StatusLabel = React.createFactory require('../../../../../react/common/JobStatusLabel').default
Immutable = require 'immutable'

ImmutableRenderMixin = require 'react-immutable-render-mixin'
{a, div, strong, span} = React.DOM
timeInWords = require('../../../../../utils/duration').timeInWords
date = require '../../../../../utils/date'
{Tree} = require '@keboola/indigo-ui'

module.exports = React.createClass
  displayName: 'GoodDataResultStats'
  mixins: [ImmutableRenderMixin]

  propTypes:
    tasks: React.PropTypes.array.isRequired

  render: ->
    div className: 'table table-striped table-hover',
      div className: 'thead', key: 'table-header',
        div className: 'tr',
          span className: 'th',
            strong null, 'Id'
          span className: 'th',
            strong null, 'Name'
          span className: 'th',
            strong null, 'Started'
          span className: 'th',
            strong null, 'Duration'
          span className: 'th',
            strong null, 'Status'
          span className: 'th',
            strong null, 'Details'
          span className: 'th',
            strong null, 'Params'
      div className: 'tbody',
          _.map @props.tasks, (task, taskId) =>
            started = "N/A"
            duration = "N/A"
            status = "N/A"
            details = "N/A"
            params = Immutable.fromJS task.params
            if task.event
              duration = task.event.performance.duration
              finished = moment(task.event.created)
              started = finished.subtract(duration, 'seconds') #TODO
              status = StatusLabel({status: task.event?.type})
              if task.event.params?.details
                eventParams = Immutable.fromJS task.event.params.details
                if typeof eventParams == 'string'
                  details = eventParams
                else
                  details = React.createElement(Tree, {data: eventParams})
              started = date.format(started.toISOString())
            div className: 'tr',
              @_renderCell(taskId.toString())
              @_renderCell(task.name)
              @_renderCell(started)
              @_renderCell(timeInWords(duration))
              @_renderCell(status)
              @_renderCell(@_renderLinkIf(details))
              @_renderCell(React.createElement Tree, {data: params})

  _renderLinkIf: (value) ->
    if not value
      return null
    if not _.isString(value)
      return value
    if value.trim().startsWith('http')
      return a {target: '_blank', href: value}, 'Raw log'
    return value

  _renderCell: (value) ->
    div className: 'td',
      value or "N/A"
