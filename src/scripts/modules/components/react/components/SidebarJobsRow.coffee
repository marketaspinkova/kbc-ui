React = require 'react'


JobStatusCircle = React.createFactory(require('../../../../react/common/JobStatusCircle').default)
FinishedWithIcon = React.createFactory(require('../../../../react/common/FinishedWithIcon').default)
Duration = React.createFactory(require('@keboola/indigo-ui').Duration)
ImmutableRendererMixin = require 'react-immutable-render-mixin'
JobPartialRunLabel = React.createFactory(require('../../../../react/common/JobPartialRunLabel').default)

Link = React.createFactory(require('react-router').Link)

{div, span, a, em, strong, small} = React.DOM

JobNavRow = React.createClass
  displayName: 'LatestJobsRow'
  propTypes:
    job: React.PropTypes.object.isRequired

  render: ->
    Link
      className: "list-group-item"
      to: 'jobDetail'
      params:
        jobId: @props.job.get('id')
    ,
     span className: 'table',
      span className: 'tr',
        span className: 'td kbc-td-status',
          JobStatusCircle status: @props.job.get('status')
        span className: 'td',
          div null,
            JobPartialRunLabel
              job: @props.job
            @props.job.getIn ['token', 'description']
          div null,
            small className: 'pull-left',
              if @props.job.get('startTime')
                Duration startTime: @props.job.get('startTime'), endTime: @props.job.get('endTime'), showIcon: true
            small className: 'pull-right',
              FinishedWithIcon endTime: @props.job.get('endTime'), tooltipPlacement: 'bottom'


module.exports = JobNavRow
