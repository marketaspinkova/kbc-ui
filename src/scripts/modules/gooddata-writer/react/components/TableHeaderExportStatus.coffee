React = require 'react'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
goodDataWriterStore = require '../../store'
RoutesStore = require('../../../../stores/RoutesStore').default

Tooltip = require('../../../../react/common/Tooltip').default
{Loader} = require '@keboola/indigo-ui'

{button, span} = React.DOM

module.exports = React.createClass
  displayName: 'GoodDataWriterTableExportStatus'
  mixins: [createStoreMixin(goodDataWriterStore)]


  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('table')

    table: goodDataWriterStore.getTable(configId, tableId)
    configurationId: configId

  render: ->
    if @_isExported()
      iconClass = 'text-success'
    else
      iconClass = 'text-muted'

    React.DOM.small null,
      React.createElement Tooltip, tooltip: @_tooltip(),
        React.DOM.span
          className: "fa fa-upload #{iconClass}"
      @_loader()

  _loader: ->
    isSaving = @state.table.get('savingFields').contains 'isExported'
    isReset = @state.table.get('pendingActions').contains 'resetTable'
    isSync = @state.table.get('pendingActions').contains 'syncTable'
    if isSaving || isReset || isSync
      React.DOM.span null,
        ' '
        React.createElement Loader

  _tooltip: ->
    if @_isExported()
      'Table is exported'
    else
      'Table is not exported'

  _isExported: ->
    @state.table.getIn ['data', 'isExported']
