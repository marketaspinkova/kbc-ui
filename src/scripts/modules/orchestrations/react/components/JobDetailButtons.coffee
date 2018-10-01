React = require 'react'
createStoreMixin = require('../../../../react/mixins/createStoreMixin')
JobsStore = require('../../stores/OrchestrationJobsStore').default
ActionCreators = require('../../ActionCreators')
RoutesStore = require('../../../../stores/RoutesStore')
JobTerminateButton = React.createFactory(require('./JobTerminateButton'))
JobRetryButton = React.createFactory(require('./JobRetryButton'))

{span} = React.DOM

module.exports = React.createClass
  displayName: 'JobDetailButtons'
  mixins: [createStoreMixin(JobsStore)]

  _getJobId: ->
    RoutesStore.getCurrentRouteIntParam 'jobId'

  getStateFromStores: ->
    jobId = @_getJobId()
    job: JobsStore.getJob jobId
    isSaving: JobsStore.getIsJobRetrying jobId

  render: ->
    span null,
      JobRetryButton
        job: @state.job
        notify: true
        isSaving: @state.isSaving
      JobTerminateButton
        job: @state.job