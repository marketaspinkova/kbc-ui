React = require 'react'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'

OrchestrationsActionCreators = require '../../ActionCreators'
OrchestrationJobsStore = require('../../stores/OrchestrationJobsStore').default
RoutesStore = require '../../../../stores/RoutesStore'
RefreshIcon = React.createFactory(require('@keboola/indigo-ui').RefreshIcon)

JobReloaderButton = React.createClass
  displayName: 'JobReloaderButton'
  mixins: [createStoreMixin(OrchestrationJobsStore)]

  _getJobId: ->
    RoutesStore.getCurrentRouteIntParam 'jobId'

  getStateFromStores: ->
    isLoading: OrchestrationJobsStore.isJobLoading(@_getJobId())

  _handleRefreshClick: ->
    OrchestrationsActionCreators.loadJobForce(@_getJobId())

  render: ->
    RefreshIcon isLoading: @state.isLoading, onClick: @_handleRefreshClick


module.exports = JobReloaderButton
