React = require 'react'


JobStatusCircle = React.createFactory(require('../../../../../react/common/JobStatusCircle').default)
FinishedWithIcon = React.createFactory(require('../../../../../react/common/FinishedWithIcon').default)
DurationWithIcon = React.createFactory(require('../../../../../react/common/DurationWithIcon').default)
ImmutableRendererMixin = require 'react-immutable-render-mixin'

Link = React.createFactory(require('react-router').Link)

{div, span, a, em, strong} = React.DOM

JobNavRow = React.createClass
  displayName: 'JobsNavRow'
  mixins: [ImmutableRendererMixin]
  propTypes:
    job: React.PropTypes.object.isRequired
    isActive: React.PropTypes.bool.isRequired

  render: ->
    className = if  @props.isActive then 'active' else ''

    Link
      className: "list-group-item #{className}"
      to: 'orchestrationJob'
      params:
        orchestrationId: @props.job.get('orchestrationId')
        jobId: @props.job.get('id')
    ,
     span className: 'table',
      span className: 'tr',
        span className: 'td kbc-td-status col-xs-1',
          JobStatusCircle status: @props.job.get('status')
        span className: 'td',
          if @props.job.get('initializedBy') == 'manually'
            em title: @props.job.getIn(['initiatorToken', 'description']), 'manually'
          strong null,
            @props.job.getIn(['initiatorToken', 'description'])
          span null,
            if @props.job.get('startTime')
              DurationWithIcon startTime: @props.job.get('startTime'), endTime: @props.job.get('endTime')
          span className: 'kb-info clearfix pull-right',
            FinishedWithIcon endTime: @props.job.get('endTime')


module.exports = JobNavRow
