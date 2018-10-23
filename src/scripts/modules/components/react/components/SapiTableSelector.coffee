React = require 'react'
storageTablesStore = require '../../stores/StorageTablesStore'
storageActionCreators = require '../../StorageActionCreators'
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
Select = React.createFactory(require('react-select').default)
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
validateStorageTableId = require '../../../../utils/validateStorageTableId'

module.exports = React.createClass
  displayNanme: 'SapiTableSelector'

  mixins: [createStoreMixin(storageTablesStore)]
  propTypes:
    onSelectTableFn: React.PropTypes.func.isRequired
    placeholder: React.PropTypes.string.isRequired
    value: React.PropTypes.string.isRequired
    excludeTableFn: React.PropTypes.func
    allowedBuckets: React.PropTypes.array
    disabled: React.PropTypes.bool
    clearable: React.PropTypes.bool
    autoFocus: React.PropTypes.bool

  getDefaultProps: ->
    excludeTableFn: (tableId) ->
      return false
    allowedBuckets: ['in','out']
    disabled: false
    autoFocus: false
    clearable: false

  getStateFromStores: ->
    isTablesLoading = storageTablesStore.getIsLoading()
    tables = storageTablesStore.getAll()

    #state
    isTablesLoading: isTablesLoading
    tables: tables

  componentDidMount: ->
    setTimeout ->
      storageActionCreators.loadTables()

  shouldComponentUpdate: (nextProps, nextState) ->
    nextProps.value != @props.value || nextState.isTablesLoading != @state.isTablesLoading

  render: ->
    Select
      disabled: @props.disabled
      name: 'source'
      clearable: @props.clearable
      autoFocus: @props.autoFocus
      value: @props.value
      isLoading: @state.isTablesLoading
      placeholder: @props.placeholder
      valueRenderer: @valueRenderer
      optionRenderer: @valueRenderer
      onChange: (selectedOption) =>
        tableId = selectedOption && selectedOption.value
        table = @state.tables.find (t) ->
          t.get('id') == tableId
        @props.onSelectTableFn(tableId, table)
      options: @_getTables()

  tableExist: (tableId) ->
    @state.tables.find((t) -> tableId == t.get('id'))

  valueRenderer: (op) ->
    if @tableExist(op.value)
      return op.label
    else
      return React.DOM.span className: "text-muted", op.label

  _getTables: ->
    tables = @state.tables
    tables = tables.filter (table) =>
      stage = table.get('bucket').get('stage')
      excludeTable = @props.excludeTableFn(table.get('id'), table)
      (stage in @props.allowedBuckets) and not excludeTable
    tables = tables.sort (a, b) ->
      a.get('id').localeCompare(b.get('id'))
    tables = tables.map (table) ->
      tableId = table.get 'id'
      {
        label: tableId
        value: tableId
      }
    result = tables.toList().toJS()
    hasValue = result.find((t) => t.value == @props.value)
    if !!@props.value and not hasValue
      return result.concat({label: @props.value, value: @props.value})
    else
      return result
