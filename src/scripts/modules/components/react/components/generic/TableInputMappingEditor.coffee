React = require 'react'
ColumnsSelectRow = require('./ColumnsSelectRow').default
_ = require('underscore')
Immutable = require('immutable')
{Input} = require('./../../../../../react/common/KbcBootstrap')
Input = React.createFactory Input
SapiTableSelector = React.createFactory(require('../SapiTableSelector').default)
ChangedSinceFilterInput = require('./ChangedSinceFilterInput').default
DataFilterRow = require('./DataFilterRow').default
PanelWithDetails = React.createFactory(require('@keboola/indigo-ui').PanelWithDetails)

module.exports = React.createClass
  displayName: 'TableInputMappingEditor'

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired
    initialShowDetails: React.PropTypes.bool.isRequired
    showFileHint: React.PropTypes.bool
    isDestinationDuplicate: React.PropTypes.bool.isRequired
    definition: React.PropTypes.object

  getDefaultProps: ->
    showFileHint: true
    definition: Immutable.Map()

  _handleChangeSource: (value) ->
    # use only table name from the table identifier
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("source", value)
      if value
        destination = value.substr(value.lastIndexOf(".") + 1) + ".csv"
      else
        destination = ''
      mapping = mapping.set("destination", destination)
      mapping = mapping.set("where_column", "")
      mapping = mapping.set("where_values", Immutable.List())
      mapping = mapping.set("where_operator", "eq")
      mapping = mapping.set("columns", Immutable.List())
    @props.onChange(immutable)

  _handleChangeDestination: (e) ->
    value = @props.value.set("destination", e.target.value.trim())
    @props.onChange(value)

  _getFileName: ->
    if @props.value.get("destination") && @props.value.get("destination") != ''
      return @props.value.get("destination")
    if @props.value.get("source") && @props.value.get("source") != ''
      return @props.value.get("source")
    return ''

  render: ->
    component = @
    React.DOM.div {className: 'form-horizontal clearfix'},
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
          React.DOM.label className: 'col-xs-2 control-label', 'Source'
          React.DOM.div className: 'col-xs-10',
            SapiTableSelector
              value: @props.value.get("source")
              disabled: @props.disabled
              placeholder: "Source table"
              onSelectTableFn: @_handleChangeSource
              autoFocus: true
      if (!@props.definition.has('destination'))
        React.DOM.div {className: "row col-md-12"},
          Input
            type: 'text'
            label: 'File name'
            value: @props.value.get("destination")
            disabled: @props.disabled
            placeholder: "File name"
            onChange: @_handleChangeDestination
            labelClassName: 'col-xs-2'
            wrapperClassName: 'col-xs-10'
            bsStyle: if @props.isDestinationDuplicate then 'error' else null
            help:
              if @props.isDestinationDuplicate then React.DOM.small {'className': 'error'},
                'Duplicate destination '
                React.DOM.code {}, @props.value.get("destination")
                '.'
              else React.DOM.span {className: "help-block"},
                if @props.showFileHint
                  React.DOM.span null,
                    "File will be available at"
                    React.DOM.code {}, "/data/in/tables/" + @_getFileName()

      React.DOM.div {className: "row col-md-12"},
        PanelWithDetails
          defaultExpanded: @props.initialShowDetails
          React.DOM.div {className: 'form-horizontal clearfix'},
            React.createElement ColumnsSelectRow,
              value: @props.value
              disabled: @props.disabled
              onChange: @props.onChange
              allTables: @props.tables

            React.createElement ChangedSinceFilterInput,
              mapping: @props.value
              disabled: @props.disabled
              onChange: @props.onChange

            React.createElement DataFilterRow,
              value: @props.value
              disabled: @props.disabled
              onChange: @props.onChange
              allTables: @props.tables
