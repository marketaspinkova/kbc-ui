React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'
InstalledComponetsStore = require '../../stores/InstalledComponentsStore'
RefreshIcon = React.createFactory(require('@keboola/indigo-ui').RefreshIcon)

module.exports = React.createClass
  displayName: 'ComponentsReloaderButton'
  mixins: [createStoreMixin(InstalledComponetsStore)]

  getStateFromStores: ->
    isLoading: InstalledComponetsStore.getIsLoading() || InstalledComponetsStore.getIsDeletedLoading()

  _handleRefreshClick: ->
    InstalledComponentsActionCreators.loadComponentsForce()

  render: ->
    RefreshIcon isLoading: @state.isLoading, onClick: @_handleRefreshClick
