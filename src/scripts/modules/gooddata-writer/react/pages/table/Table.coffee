React = require 'react'

createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require '../../../../../stores/RoutesStore'

goodDataWriterStore = require '../../../store'
actionCreators = require '../../../actionCreators'
storageApi = require '../../../../components/StorageApi'

{strong, br, ul, li, div, span, i, p} = React.DOM

ColumnsEditor = React.createFactory(require './DatasetColumnsEditor')
EditButtons = React.createFactory(require('../../../../../react/common/EditButtons'))
TableGdName = React.createFactory(require './TableGdNameEdit')
ActivateTableExportButton = React.createFactory(require('../../components/ActivateTableExportButton').default)

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
    referenceableTables: goodDataWriterStore.getReferenceableTablesForTable(configurationId, tableId)
    invalidColumns: goodDataWriterStore.getTableColumnsValidation(configurationId, tableId)
    showIdentifier: true # isNewWriter bc migration
    columnsReferences: goodDataWriterStore.getTableColumnsReferences(configurationId, tableId)
    columns: goodDataWriterStore.getTableColumns(configurationId,
      tableId,
      if isEditingColumns then 'editing' else 'current'
    )

  getInitialState: ->
    dataPreview: null

  componentDidMount: ->
    if not @state.isEditingColumns and @_isAllColumnsIgnored()
      @_handleEditStart()
    component = @
    storageApi
    .tableDataPreview @state.table.get('id'),
      limit: 10
    .then (csv) ->
      component.setState
        dataPreview: csv

  _isAllColumnsIgnored: ->
    this.state.columns.reduce((memo, c) ->
      memo && c.get('type') == 'IGNORE'
    , true)

  _handleEditStart: ->
    actionCreators.startTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditSave: ->
    actionCreators.saveTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditCancel: ->
    actionCreators.cancelTableColumnsEdit(@state.configurationId, @state.table.get 'id')

  _handleEditUpdate: (column) ->
    actionCreators.updateTableColumnsEdit(@state.configurationId, @state.table.get('id'), column)

  render: ->
    canEditTitle = @state.showIdentifier || !@state.table.getIn(['data', 'isExported'], true)
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        div className: 'row kbc-header',
          if @state.showIdentifier
            p className: '',
              strong className: 'col-xs-2', 'Identifier'
              ' '
              TableGdName
                table: @state.table
                configurationId: @state.configurationId
                fieldName: 'identifier'
                canEdit: !@state.table.getIn(['data', 'isExported'], true)
                editTooltip: (if @state.table.getIn ['data', 'isExported']
                  'Identifier cannot be changed. It is already exported to GoodData'
                else
                  'Edit GoodData identifier')
          p className: '',
            strong className: 'col-xs-2', 'Title'
            ' '
            TableGdName
              table: @state.table
              configurationId: @state.configurationId
              fieldName: 'title'
              placeholder: 'Table Name'
              canEdit: canEditTitle
              editTooltip: (if !canEditTitle
                'Title cannot be changed. It is already exported to GoodData'
              else
                'Edit title in GoodData')
          p className: '',
            strong
              style: {'padding-top': '6px'}
              className: 'col-xs-2'
              'Project Upload'
            ActivateTableExportButton
              configId: @state.configurationId
              table: @state.table

          div className: 'kbc-buttons',
            EditButtons
              isEditing: @state.isEditingColumns
              isSaving: @state.isSavingColumns
              isDisabled: @state.invalidColumns.count() > 0 or @_isAllColumnsIgnored()
              onCancel: @_handleEditCancel
              onSave: @_handleEditSave
              onEditStart: @_handleEditStart
              editLabel: 'Edit Columns'

        ColumnsEditor
          columns: @state.columns
          invalidColumns: @state.invalidColumns
          columnsReferences: @state.columnsReferences
          referenceableTables: @state.referenceableTables
          showIdentifier: @state.showIdentifier
          isEditing: @state.isEditingColumns
          isSaving: @state.isSavingColumns
          onColumnChange: @_handleEditUpdate
          configurationId: @state.configurationId
          dataPreview: @state.dataPreview
          isExported: @state.table.getIn(['data', 'isExported'], false)
