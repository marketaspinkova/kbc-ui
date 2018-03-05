React = require 'react'
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'
_ = require('underscore')
Immutable = require('immutable')
Input = React.createFactory require('./../../../../../react/common/KbcBootstrap').Input
Select = React.createFactory require('../../../../../react/common/Select').default
AutosuggestWrapper = require('../../../../transformations/react/components/mapping/AutoSuggestWrapper').default
DestinationTableSelector = require('../../../../../react/common/DestinationTableSelector').default
tableIdParser = require('../../../../../utils/tableIdParser').default

module.exports = React.createClass
  displayName: 'TableOutputMappingEditor'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    buckets: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired
    backend: React.PropTypes.string.isRequired
    definition: React.PropTypes.object,
    initialShowDetails: React.PropTypes.bool.isRequired

  getDefaultProps: ->
    definition: Immutable.Map()

  getInitialState: ->
    showDetails: @props.initialShowDetails

  _handleToggleShowDetails: (e) ->
    @setState(
      showDetails: e.target.checked
    )

  _parseDestination: ->
    destination = @props.value.get('destination')
    tableIdParser.parse(destination, {defaultStage: 'out'})

  _handleBlurSource: (e) ->
    sourceValue = e.target.value
    dstParser = @_parseDestination()
    if !dstParser.parts.table
      newDestination = dstParser.setPart('table', sourceValue)
      @_handleChangeDestination(newDestination.tableId)

  _handleChangeSource: (e) ->
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("source", e.target.value.trim())
    @props.onChange(immutable)

  _handleChangeDestination: (newValue) ->
    value = @props.value.set("destination", newValue.trim())

    if @props.tables.get(value.get("destination"))
      value = value.set(
        "primary_key",
        @props.tables.getIn([value.get("destination"), "primaryKey"], Immutable.List())
      )

    @props.onChange(value)

  _updateDestinationPart: (partName, value) ->
    @_handleChangeDestination(@_parseDestination().setPart(partName,value).tableId)


  _handleChangeIncremental: (e) ->
    value = @props.value.set("incremental", e.target.checked)
    @props.onChange(value)

  _handleChangePrimaryKey: (newValue) ->
    value = @props.value.set("primary_key", newValue)
    @props.onChange(value)

  _handleChangeDeleteWhereColumn: (newValue) ->
    value = @props.value.set("delete_where_column", newValue.trim())
    value = value.set("delete_where_operator", value.get("delete_where_operator", 'eq'))
    @props.onChange(value)

  _handleChangeDeleteWhereOperator: (e) ->
    value = @props.value.set("delete_where_operator", e.target.value)
    @props.onChange(value)

  _handleChangeDeleteWhereValues: (newValue) ->
    value = @props.value.set("delete_where_values", newValue)
    @props.onChange(value)

  _getTablesAndBuckets: ->
    tablesAndBuckets = @props.tables.merge(@props.buckets)

    inOut = tablesAndBuckets.filter((item) ->
      item.get("id").substr(0, 3) == "in." || item.get("id").substr(0, 4) == "out."
    )

    map = inOut.sortBy((item) ->
      item.get("id")
    ).map((item) ->
      item.get("id")
    )

    map.toList()

  _getColumns: ->
    if !@props.value.get("destination")
      return Immutable.List()
    props = @props
    table = @props.tables.find((table) ->
      table.get("id") == props.value.get("destination")
    )
    if !table
      return Immutable.List()
    table.get("columns")

  render: ->
    component = @
    React.DOM.div {className: 'form-horizontal clearfix'},
      React.DOM.div null,
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group form-group-sm',
            React.DOM.div className: 'col-xs-10 col-xs-offset-2',
              Input
                standalone: true
                type: 'checkbox'
                label: React.DOM.small {}, 'Show details'
                checked: @state.showDetails
                onChange: @_handleToggleShowDetails
        if (!@props.definition.has('source'))
          React.DOM.div {className: "row col-md-12"},
            Input
              type: 'text'
              name: 'source'
              label: 'File'
              value: @props.value.get("source")
              disabled: @props.disabled
              placeholder: "File name"
              onBlur: @_handleBlurSource
              onChange: @_handleChangeSource
              labelClassName: 'col-xs-2'
              wrapperClassName: 'col-xs-10'
              autoFocus: true
              help: React.DOM.span {},
                "File will be uploaded from"
                React.DOM.code {}, "/data/out/tables/" + @props.value.get("source", "")
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group',
            React.DOM.label className: 'col-xs-2 control-label', 'Destination'
            React.DOM.div className: 'col-xs-10',
              React.createElement DestinationTableSelector,
                currentSource: @props.value.get("source")
                updatePart: @_updateDestinationPart
                disabled: false
                parts: @_parseDestination().parts
                tables: @props.tables
                buckets: @props.buckets
                placeholder: 'Storage table where \
                the source file data will be loaded to - you can create a new table or use an existing one.'
              if @state.showDetails
                Input
                  standalone: true
                  name: 'incremental'
                  type: 'checkbox'
                  label: React.DOM.small {}, 'Incremental'
                  checked: @props.value.get("incremental")
                  disabled: @props.disabled
                  onChange: @_handleChangeIncremental
                  help: React.DOM.small {},
                    "If the destination table exists in Storage,
                    output mapping does not overwrite the table, it only appends the data to it.
                    Uses incremental write to Storage."
        if @state.showDetails
          React.DOM.div {className: "row col-md-12"},
            React.DOM.div {className: "form-group form-group-sm"},
              React.DOM.label {className: "control-label col-xs-2"},
                React.DOM.span null,
                  "Primary key"
              React.DOM.div {className: "col-xs-10"},
                Select
                  name: 'primary_key'
                  value: @props.value.get('primary_key')
                  multi: true
                  disabled: @props.disabled
                  allowCreate: (@_getColumns().size == 0)
                  delimiter: ','
                  placeholder: 'Add a column to primary key...'
                  emptyStrings: false
                  noResultsText: 'No matching column found'
                  help: React.DOM.small {},
                    "Primary key of the table in Storage. If the table already exists, primary key must match."
                  onChange: @_handleChangePrimaryKey
                  options: @_getColumns().map((option) ->
                    return {
                      label: option
                      value: option
                    }
                  ).toJS()

        if @state.showDetails
          React.DOM.div {className: "row col-md-12"},
            React.DOM.div className: 'form-group form-group-sm',
              React.DOM.label className: 'col-xs-2 control-label', 'Delete rows'
              React.DOM.div className: 'col-xs-4',
                React.createElement AutosuggestWrapper,
                  suggestions: @_getColumns()
                  placeholder: 'Select column'
                  value: @props.value.get("delete_where_column", "")
                  onChange: @_handleChangeDeleteWhereColumn
              React.DOM.div className: 'col-xs-2',
                Input
                  bsSize: 'small'
                  type: 'select'
                  name: 'deleteWhereOperator'
                  value: @props.value.get("delete_where_operator")
                  disabled: @props.disabled
                  onChange: @_handleChangeDeleteWhereOperator
                  groupClassName: "no-bottom-margin"
                ,
                  React.DOM.option {value: "eq"}, "= (IN)"
                  React.DOM.option {value: "ne"}, "!= (NOT IN)"
              React.DOM.div className: 'col-xs-4',
                Select
                  name: 'deleteWhereValues'
                  value: @props.value.get('delete_where_values')
                  multi: true
                  disabled: @props.disabled
                  allowCreate: true
                  delimiter: ','
                  placeholder: 'Add a value...'
                  emptyStrings: true,
                  onChange: @_handleChangeDeleteWhereValues
              React.DOM.div className: 'col-xs-10 col-xs-offset-2 small help-block bottom-margin',
                "Delete matching rows in the destination table before importing the result"
