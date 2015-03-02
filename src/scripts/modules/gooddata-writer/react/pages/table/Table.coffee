React = require 'react'

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
RoutesStore = require '../../../../../stores/RoutesStore'

goodDataWriterStore = require '../../../store'
actionCreators = require '../../../actionCreators'

{strong, br, ul, li, div, span, i} = React.DOM

ColumnsEditor = React.createFactory(require './DatasetColumnsEditor')
EditButtons = React.createFactory(require('../../../../../react/common/EditButtons'))

module.exports = React.createClass
  displayName: 'GooddDataWriterTable'
  mixins: [createStoreMixin(goodDataWriterStore)]

  getStateFromStores: ->
    configurationId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('table')
    isEditingColumns = goodDataWriterStore.isEditingTableColumns(configurationId, tableId)

    configurationId: configurationId
    table: goodDataWriterStore.getTable(configurationId, tableId)
    isEditingColumns: isEditingColumns
    isSavingColumns: goodDataWriterStore.isSavingTableColumns(configurationId, tableId)
    columns: goodDataWriterStore.getTableColumns(configurationId,
      tableId,
      if isEditingColumns then 'editing' else 'current'
    )

  _handleEditStart: ->
    actionCreators.startTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditSave: ->
    actionCreators.saveTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditCancel: ->
    actionCreators.cancelTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditUpdate: (column) ->
    actionCreators.updateTableColumnsEdit(@state.configurationId, @state.table.get('id'), column)

  render: ->
    div className: 'container-fluid kbc-main-content',
      div className: 'row kbc-header',
        div className: 'col-sm-8'
        div className: 'col-sm-4 kbc-buttons',
          EditButtons
            isEditing: @state.isEditingColumns
            isSaving: @state.isSavingColumns
            onCancel: @_handleEditCancel
            onSave: @_handleEditSave
            onEditStart: @_handleEditStart
            editLabel: 'Edit columns'

      ColumnsEditor
        columns: @state.columns
        isEditing: @state.isEditingColumns
        onColumnChange: @_handleEditUpdate