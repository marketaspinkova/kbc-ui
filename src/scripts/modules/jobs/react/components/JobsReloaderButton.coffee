React = require('react')
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
JobsStore = require('../../stores/JobsStore')
RefreshIcon = React.createFactory(require('@keboola/indigo-ui').RefreshIcon)
ActionCreators = require('../../ActionCreators')


JobsReloaderButton = React.createClass
  displayName: 'JobsReloaderButton'
  mixins: [createStoreMixin(JobsStore)]

  getStateFromStores: ->
    jobsLoading: JobsStore.getIsLoading()

  _handleRefreshClick: ->
    ActionCreators.reloadJobs()


  render: ->
    RefreshIcon isLoading: @state.jobsLoading, onClick: @_handleRefreshClick

module.exports = JobsReloaderButton
