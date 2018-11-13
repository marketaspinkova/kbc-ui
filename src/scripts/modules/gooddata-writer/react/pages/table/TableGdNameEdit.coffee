React = require 'react'

InlineEditText = React.createFactory(require('../../../../../react/common/InlineEditTextInput').default)
actionCreators = require '../../../actionCreators'

module.exports = React.createClass
  displayName: 'TableGdName'
  propTypes:
    table: React.PropTypes.object.isRequired
    configurationId: React.PropTypes.string.isRequired
    fieldName: React.PropTypes.string.isRequired
    placeholder: React.PropTypes.string.isRequired
    canEdit: React.PropTypes.bool.isRequired
    editTooltip: React.PropTypes.string.isRequired

  getDefaultProps: ->
    fieldName: 'title'

  _handleEditStart: ->
    return if !@props.canEdit
    actionCreators.startTableFieldEdit(@props.configurationId, @props.table.get('id'), @props.fieldName)

  _handleEditSave: ->
    actionCreators.saveTableField(
      @props.configurationId,
      @props.table.get('id'),
      @props.fieldName,
      @props.table.getIn(['editingFields', @props.fieldName]).trim()
    )

  _handleEditCancel: ->
    actionCreators.cancelTableFieldEdit(@props.configurationId, @props.table.get('id'), @props.fieldName)

  _handleEditChange: (column) ->
    actionCreators.updateTableFieldEdit(@props.configurationId, @props.table.get('id'), @props.fieldName, column)

  render: ->
    isEditing = @props.table.hasIn ['editingFields', @props.fieldName]
    isSaving = @props.table.get('savingFields').contains @props.fieldName

    if isEditing
      text = @props.table.getIn(['editingFields', @props.fieldName])
    else
      text = @props.table.getIn(['data', @props.fieldName])

    InlineEditText
      text: text
      editTooltip: @props.editTooltip
      placeholder: @props.placeholder
      isSaving: isSaving
      isEditing: isEditing
      isValid: true
      onEditStart: @_handleEditStart
      onEditCancel: @_handleEditCancel
      onEditChange: @_handleEditChange
      onEditSubmit: @_handleEditSave
