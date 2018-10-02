React = require 'react'
createStoreMixin = require('../../../../react/mixins/createStoreMixin')
JobsStore = require('../../stores/JobsStore')
RoutesStore = require('../../../../stores/RoutesStore')
JobTerminateButton = React.createFactory(require('./JobTerminateButton').default)

{span} = React.DOM

module.exports = React.createClass
  displayName: 'JobDetailButtons'
  mixins: [createStoreMixin(JobsStore)]

  _getJobId: ->
    RoutesStore.getCurrentRouteIntParam 'jobId'

  getStateFromStores: ->
    jobId = @_getJobId()
    job: JobsStore.get jobId

  render: ->
    if @state.job
      span null,
        JobTerminateButton
          job: @state.job
    else
      null
