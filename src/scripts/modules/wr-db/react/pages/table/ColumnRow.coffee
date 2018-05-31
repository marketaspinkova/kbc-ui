React = require 'react'
_ = require 'underscore'
{input, option, tr, td, div, span} = React.DOM
Check = React.createFactory(require('@keboola/indigo-ui').Check)
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
ColumnDataPreview = React.createFactory(require './ColumnDataPreview')



module.exports = React.createClass
  displayName: "WrColumnRow"
  propTypes:
    column: React.PropTypes.object
    editingColumn: React.PropTypes.object
    editColumnFn: React.PropTypes.func
    dataTypes: React.PropTypes.array
    isSaving: React.PropTypes.bool
    dataPreview: React.PropTypes.array
    isValid: React.PropTypes.bool
    disabledFields: React.PropTypes.array

  render: ->
    if @props.editingColumn
      @_renderEditing()
    else
      @_renderStatic()

  _renderEditing: ->
    trClass = 'danger' if not @props.isValid
    tr className: trClass,
      td className: 'kbc-static-cell', @props.column.get('name')
      td null, @_createInput('dbName')
      @_renderTypeSelect()
      td null, @_createCheckbox('null')
      td null, @_createInput('default')
      td null,
        ColumnDataPreview
          columnName: @props.column.get('name')
          tableData: @props.dataPreview

  _renderTypeSelect: ->
    dtype = @props.editingColumn.get 'type'
    td null,
      Input
        bsSize: 'small'
        type: 'select'
        value: dtype
        disabled: @props.isSaving
        onChange: (e) =>
          value = e.target.value
          newColumn = @props.editingColumn.set('type', value)
          if value == 'IGNORE'
            newColumn = newColumn.set('default', '')
          if _.isString @_getSizeParam(value)
            defaultSize = @_getSizeParam(value)
            newColumn = newColumn.set('size', defaultSize)
          else
            newColumn = newColumn.set('size', '')
          @props.editColumnFn(newColumn)
      ,
        @_selectOptions()
      ' '
      @_createInput('size') if _.isString @_getSizeParam(dtype)

  _getSizeParam: (dataType) ->
    dt = _.find @props.dataTypes, (d) ->
      _.isObject(d) and _.keys(d)[0] == dataType
    dt?[dataType]?.defaultSize


  _getDataTypes: ->
    return _.map @props.dataTypes, (dataType) ->
      #it could be object eg {VARCHAR: {defaultSize:''}}
      if _.isObject dataType
        return _.keys(dataType)[0]
      else #or string
        return dataType


  _selectOptions: ->
    dataTypes = @_getDataTypes()
    _.map dataTypes.sort().concat('IGNORE'), (opKey, opValue) ->
      option
        value: opKey
        key: opKey
      ,
        opKey

  _createCheckbox: (property) ->
    if property == 'null' and 'nullable' in @props.disabledFields
      return ''
    if @props.editingColumn.get('type') == 'IGNORE'
      return ''
    isChecked = @props.editingColumn.get(property) == '1'
    div className: 'text-center checkbox',
      input
        type: 'checkbox'
        checked: isChecked
        onChange: (e) =>
          newValue = if e.target.checked then '1' else '0'
          newColumn = @props.editingColumn.set(property, newValue)
          @props.editColumnFn(newColumn)


  _createInput: (property, type = 'text') ->
    if property == 'default' and 'default' in @props.disabledFields
      return ''
    if @props.editingColumn.get('type') == 'IGNORE'
      return ''
    Input
      type: type
      bsSize: 'small'
      value: @props.editingColumn.get property
      disabled: @props.isSaving
      onChange: (e) =>
        newValue = e.target.value
        newColumn = @props.editingColumn.set(property, newValue)
        @props.editColumnFn(newColumn)



  _renderStatic: ->
    tr null,
      td className: 'kbc-static-cell', @props.column.get('name')
      td className: 'kbc-static-cell', @props.column.get('dbName')
      @_renderType()
      @_renderNull()
      @_renderDefault()
      td null,
        ColumnDataPreview
          columnName: @props.column.get('name')
          tableData: @props.dataPreview



  _renderDefault: ->
    val = @props.column.get 'default'
    if @_isIgnored()
      val = 'N/A'
    if 'default' in @props.disabledFields
      val = ''
    return td className: 'kbc-static-cell', val


  _renderType: ->
    type = @props.column.get('type')
    size = @props.column.get('size')
    if size
      type = "#{type}(#{size})"
    return td className: 'kbc-static-cell', type

  _renderNull: ->
    isChecked = @props.column.get('null') == '1'
    nullVal = Check({isChecked: isChecked})
    if @_isIgnored()
      nullVal = 'N/A'
    if 'nullable' in @props.disabledFields
      nullVal = ''
    return td className: 'kbc-static-cell', nullVal

  _isIgnored: ->
    @props.column.get('type') == 'IGNORE'
