React = require 'react'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
JobsStore = require('../../stores/JobsStore')
ActionCreators = require('../../ActionCreators')
RoutesStore = require('../../../../stores/RoutesStore')
TerminateButton = require('../../../../react/common/JobTerminateButton').default

{button, span} = React.DOM

module.exports = React.createClass
  displayName: 'JobTerminateButton'
  mixins: [createStoreMixin(JobsStore)]

  _getJobId: ->
    RoutesStore.getCurrentRouteIntParam 'jobId'

  getStateFromStores: ->
    jobId = @_getJobId()
    job: JobsStore.get jobId
    isTerminating: JobsStore.getIsJobTerminating jobId

  _handleTerminate: ->
    ActionCreators.terminateJob @state.job.get 'id'

  render: ->
    React.createElement TerminateButton,
      job: @state.job
      isTerminating: @state.isTerminating
      onTerminate: @_handleTerminate
