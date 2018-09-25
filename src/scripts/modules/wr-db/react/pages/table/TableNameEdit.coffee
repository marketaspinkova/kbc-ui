React = require 'react'

InlineEditText = React.createFactory(require '../../../../../react/common/InlineEditTextInput')
actionCreators = require('../../../actionCreators').default

module.exports = React.createClass
  displayName: 'TableDatabaseNameEdit'
  propTypes:
    table: React.PropTypes.object
    configId: React.PropTypes.string
    componentId: React.PropTypes.string
    setEditValueFn: React.PropTypes.func
    editingValue: React.PropTypes.string
    currentValue: React.PropTypes.string

  _handleEditStart: ->
    @props.setEditValueFn(@props.currentValue)

  _handleEditSave: ->
    isExported = @props.tableExportedValue
    setFn = actionCreators.setTableToExport
    setFn(@props.componentId, @props.configId, @props.tableId, @props.editingValue, isExported).then =>
      @props.setEditValueFn(null)

  _handleEditCancel: ->
    @props.setEditValueFn(null)

  _handleEditChange: (value) ->
    @props.setEditValueFn(value)


  render: ->
    isEditing = (!!@props.editingValue)
    isSaving = @props.isSaving
    text = if isEditing then @props.editingValue else @props.currentValue

    InlineEditText
      text: text
      editTooltip: 'edit database table name'
      placeholder: 'Table Name'
      isSaving: isSaving
      isEditing: isEditing
      isValid: true
      onEditStart: @_handleEditStart
      onEditCancel: @_handleEditCancel
      onEditChange: @_handleEditChange
      onEditSubmit: @_handleEditSave
