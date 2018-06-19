React = require 'react'
ImmutableRenderMixin = require 'react-immutable-render-mixin'
_ = require('underscore')
Immutable = require('immutable')
FormGroup = React.createFactory(require('react-bootstrap').FormGroup)
FormControl = React.createFactory(require('react-bootstrap').FormControl)
Input = React.createFactory require('./../../../../../react/common/KbcBootstrap').Input
AutosuggestWrapper = require('./AutoSuggestWrapper').default
Select = React.createFactory require('../../../../../react/common/Select').default
DestinationTableSelector = require('../../../../../react/common/DestinationTableSelector').default
tableIdParser = require('../../../../../utils/tableIdParser').default
stringUtils = require('../../../../../utils/string').default

module.exports = React.createClass
  displayName: 'OutputMappingRowEditor'
  mixins: [ImmutableRenderMixin]

  propTypes:
    transformationBucket: React.PropTypes.object.isRequired
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    buckets: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired
    backend: React.PropTypes.string.isRequired
    type: React.PropTypes.string.isRequired
    initialShowDetails: React.PropTypes.bool.isRequired
    definition: React.PropTypes.object
    isNameAlreadyInUse: React.PropTypes.bool.isRequired

  getDefaultProps: ->
    definition: Immutable.Map()

  _parseDestination: ->
    bucketName = stringUtils.webalize(@props.transformationBucket.get('name'))
    if not bucketName.startsWith('c-')
      bucketName = 'c-' + bucketName
    destination = @props.value.get('destination')
    tableIdParser.parse(destination, {defaultStage: 'out', defaultBucket: bucketName})

  _handleBlurSource: (e) ->
    isFileMapping = !@props.definition.has('source')
    sourceValue = e.target.value
    lastDotIdx = sourceValue.lastIndexOf('.')
    if isFileMapping and lastDotIdx > 0
      sourceValue = sourceValue.substring(0, lastDotIdx)
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
        "primaryKey",
        @props.tables.getIn([value.get("destination"), "primaryKey"], Immutable.List())
      )
    @props.onChange(value)

  _updateDestinationPart: (partName, value) ->
    @_handleChangeDestination(@_parseDestination().setPart(partName,value).tableId)


  _handleChangeIncremental: (e) ->
    if e.target.checked
      value = @props.value
        .set("incremental", e.target.checked)
        .set("deleteWhereColumn", "")
        .set("deleteWhereOperator", "eq")
        .set("deleteWhereValues", Immutable.List())
    else
      value = @props.value
        .delete("incremental")
        .delete("deleteWhereColumn")
        .delete("deleteWhereOperator")
        .delete("deleteWhereValues")
    @props.onChange(value)

  _handleChangePrimaryKey: (newValue) ->
    value = @props.value.set("primaryKey", newValue)
    @props.onChange(value)

  _handleChangeDeleteWhereColumn: (newValue) ->
    value = @props.value
      .set("deleteWhereColumn", newValue.trim())
    @props.onChange(value)

  _handleChangeDeleteWhereOperator: (e) ->
    value = @props.value.set("deleteWhereOperator", e.target.value)
    @props.onChange(value)

  _handleChangeDeleteWhereValues: (newValue) ->
    value = @props.value.set("deleteWhereValues", newValue)
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
     if (!@props.definition.has('source'))
       React.DOM.div {className: "row col-md-12"},
         if @props.backend == 'docker'
           Input
             type: 'text'
             name: 'source'
             label: 'File'
             autoFocus: true
             value: @props.value.get("source")
             disabled: @props.disabled
             placeholder: "File name"
             onBlur: @_handleBlurSource
             onChange: @_handleChangeSource
             onBlur: @_handleBlurSource
             labelClassName: 'col-xs-2'
             wrapperClassName: 'col-xs-10'
             help: React.DOM.span {},
               "File will be uploaded from "
               React.DOM.code {},
                 "/data/out/tables/" + @props.value.get("source", "")
               "."
               (if @props.isNameAlreadyInUse then " Filename already in use.")
         else
           Input
             type: 'text'
             help: 'Name of a source table generated by running the transformation query script.'
             name: 'source'
             label: 'Source'
             autoFocus: true
             value: @props.value.get("source")
             disabled: @props.disabled
             placeholder: "Source table in transformation DB"
             onBlur: @_handleBlurSource
             onChange: @_handleChangeSource
             labelClassName: 'col-xs-2'
             wrapperClassName: 'col-xs-10'
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
             the source table data will be loaded to - you can create a new table or use an existing one.'
     React.DOM.div {className: "row col-md-12"},
       React.DOM.div {className: 'form-horizontal clearfix'},
         React.DOM.div {className: "form-group"},
           React.DOM.label {className: "control-label col-xs-2"},
             React.DOM.span null,
           React.DOM.div {className: "col-xs-10"},
             Input
               standalone: true
               name: 'incremental'
               type: 'checkbox'
               label: 'Incremental'
               checked: @props.value.get("incremental")
               disabled: @props.disabled
               onChange: @_handleChangeIncremental
               help: "If the destination table exists in Storage,
                 output mapping does not overwrite the table, it only appends the data to it.
                 Uses incremental write to Storage."
         React.DOM.div {className: "form-group"},
           React.DOM.label {className: "control-label col-xs-2"},
             React.DOM.span null,
               "Primary key"
           React.DOM.div {className: "col-xs-10"},
             Select
               name: 'primaryKey'
               value: @props.value.get('primaryKey')
               multi: true
               trimMultiCreatedValues: true
               disabled: @props.disabled
               allowCreate: (@_getColumns().size == 0)
               delimiter: ','
               placeholder: 'Add a column to primary key...'
               emptyStrings: false
               noResultsText: 'No matching column found'
               help: "Primary key of the table in Storage. If the table already exists, primary key must match."
               onChange: @_handleChangePrimaryKey
               options: @_getColumns().map((option) ->
                 return {
                   label: option
                   value: option
                 }
               ).toJS()

         if (@props.value.get("incremental") || @props.value.get("deleteWhereColumn", "") != "")
           React.DOM.div className: 'form-group',
             React.DOM.label className: 'col-xs-2 control-label', 'Delete rows'
             React.DOM.div className: 'col-xs-4',
               React.createElement AutosuggestWrapper,
                 suggestions: @_getColumns()
                 placeholder: 'Select column'
                 value: @props.value.get("deleteWhereColumn", "")
                 onChange: @_handleChangeDeleteWhereColumn
             React.DOM.div className: 'col-xs-2',
               FormGroup className: "no-bottom-margin",
                 FormControl
                   componentClass: "select"
                   name: 'deleteWhereOperator'
                   value: @props.value.get("deleteWhereOperator")
                   disabled: @props.disabled
                   onChange: @_handleChangeDeleteWhereOperator
                 ,
                   React.DOM.option {value: "eq"}, "= (IN)"
                   React.DOM.option {value: "ne"}, "!= (NOT IN)"
             React.DOM.div className: 'col-xs-4',
               Select
                 name: 'deleteWhereValues'
                 value: @props.value.get('deleteWhereValues')
                 multi: true
                 disabled: @props.disabled
                 allowCreate: true
                 delimiter: ','
                 placeholder: 'Add a value...'
                 emptyStrings: true,
                 onChange: @_handleChangeDeleteWhereValues
             React.DOM.div className: 'col-xs-10 col-xs-offset-2 help-block bottom-margin',
               "Delete matching rows in the destination table before importing the result"
