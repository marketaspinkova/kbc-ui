React = require 'react'
{fromJS, Map} = require 'immutable'
_ = require 'underscore'
tdeCommon = require '../../../tdeCommon'
createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require '../../../../../stores/RoutesStore'
StorageStore = require '../../../../components/stores/StorageTablesStore'
InstalledComponentsActions = require '../../../../components/InstalledComponentsActionCreators'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
FilterTableModal = require('../../../../components/react/components/generic/TableFiltersOnlyModal').default
FiltersDescription = require '../../../../components/react/components/generic/FiltersDescription'

InlineEditText = React.createFactory(require '../../../../../react/common/InlineEditTextInput')
ColumnsTable = require './ColumnsTable'
storageApi = require '../../../../components/StorageApi'
{Input, FormControls} = require './../../../../../react/common/KbcBootstrap'
StaticText = FormControls.Static
{form, small, label, input, select, option, button, i, strong, span, div, p, ul, li} = React.DOM

columnTdeTypes = ['string','boolean', 'number', 'decimal','date', 'datetime']
defaults =
  date: "%Y-%m-%d"
  datetime: "%Y-%m-%d %H:%M:%S"

componentId = 'tde-exporter'

module.exports = React.createClass
  displayName: 'tabletde'
  mixins: [createStoreMixin(InstalledComponentsStore, StorageStore)]

  getInitialState: ->
    dataPreview: null

  componentDidMount: ->
    tableId = RoutesStore.getCurrentRouteParam('tableId')
    if not @state.columnsTypes?.count()
      table = StorageStore.getAll().find (t) ->
        t.get('id') == tableId
      columns = Map()
      table.get('columns').forEach (column) ->
        columns = columns.set(column, fromJS type: 'IGNORE')
      path = ['editing', tableId]
      @_updateLocalState(path, columns)


    component = @
    storageApi
    .tableDataPreview tableId,
      limit: 10
    .then (csv) ->
      component.setState
        dataPreview: csv

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('tableId')
    configData = InstalledComponentsStore.getConfigData(componentId, configId)
    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    typedefs = configData.getIn(['parameters', 'typedefs'], Map()) or Map()
    isSaving = InstalledComponentsStore.getSavingConfigData(componentId, configId)

    table = StorageStore.getAll().find (table) ->
      table.get('id') == tableId
    columnsTypes = typedefs.get(tableId, Map())

    #enforce empty Map(not List) workaround
    if _.isEmpty(columnsTypes?.toJS())
      columnsTypes = Map()

    #tde filename
    tdeFileName = tdeCommon.getTdeFileName(configData || Map(), tableId)
    editingTdeFileName = tdeCommon.getEditingTdeFileName(configData, localState, tableId)
    mapping = tdeCommon.getTableMapping(configData or Map(), tableId)

    #state
    allTables: StorageStore.getAll()
    isSaving: isSaving
    configId: configId
    table: table
    columnsTypes: columnsTypes
    localState: localState
    tableId: tableId
    tdeFileName: tdeFileName
    editingTdeFileName: editingTdeFileName
    mapping: mapping
    editingMapping: tdeCommon.getEditingTableMapping(configData, localState, tableId)


  render: ->
    isEditing = !!@state.localState.getIn(['editing', @state.tableId])
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        @_renderFilterModal()
        div className: 'row kbc-header',
          div className: 'col-sm-2',
            @_renderHideIngored()
            if isEditing
              @_renderSetColumnsType()
            else
              ' '
          div className: 'col-sm-4', @_renderOutNameEditor(isEditing)
          div className: 'col-sm-5', @_renderTableFiltersRow(isEditing)
        React.createElement ColumnsTable,
          table: @state.table
          columnsTypes: @state.columnsTypes
          dataPreview: @state.dataPreview
          editingData: @state.localState.getIn(['editing', @state.tableId])
          onChange: @_handleEditChange
          isSaving: @state.isSaving
          hideIgnored: !! @state.localState.getIn ['hideIgnored', @state.tableId]

  _renderTableFiltersRow: (isEditing) ->
    tlabel = 'Table data filter: '
    if isEditing
      tlabel =
        span null,
          tlabel
          button
            style: {padding: '0px 10px 0px 10px'}
            className: 'btn btn-link'
            type: 'button'
            onClick: =>
              ls = @state.localState.setIn(['filterModal'], Map({show: true}))
              ls = ls.set('mappingBackup', @state.editingMapping)
              @_updateLocalStateDirectly(ls)
            span className: 'kbc-icon-pencil'
    React.createElement StaticText,
      label: tlabel
      bsSize: 'small'
      wrapperClassName: 'wrapper'
    ,
      React.createElement FiltersDescription,
        value: if isEditing then @state.editingMapping else @state.mapping
        rootClassName: ''

  _renderFilterModal: ->
    React.createElement FilterTableModal,
      value: @state.editingMapping
      allTables: @state.allTables
      show: @state.localState.getIn(['filterModal', 'show'], false)
      onResetAndHide: =>
        ls = @state.localState
        ls = ls.setIn(['editingMappings', @state.tableId], ls.get('mappingBackup'))
        ls = ls.set('filterModal', Map())
        @_updateLocalStateDirectly(ls)
      onOk: =>
        @_updateLocalState(['filterModal'], Map())
      onSetMapping: (newMapping) =>
        @_updateLocalState(['editingMappings', @state.tableId], newMapping)

  _renderOutNameEditor: (isEditing) ->
    tlabel = 'Output file name:'
    if not isEditing
      React.createElement StaticText,
        label: tlabel
        bsSize: 'small'
        wrapperClassName: 'wrapper'
      ,
        @state.tdeFileName
    else
      errorMsg = tdeCommon.assertTdeFileName(@state.editingTdeFileName)
      webalized = tdeCommon.webalizeTdeFileName(@state.editingTdeFileName)
      msg = null
      if (webalized != @state.editingTdeFileName)
        msg = "Will be saved as #{webalized}"

      React.createElement Input,
        value: @state.editingTdeFileName
        bsSize: 'small'
        bsStyle: if errorMsg then 'error' else ''
        help: small(null, errorMsg || msg)
        type: 'text'
        label: tlabel
        wrapperClassName: 'wrapper'
        onChange: (e) =>
          value = e.target.value
          path = ['editingTdeNames', @state.tableId]
          @_updateLocalState(path, value)


  _renderHideIngored: ->
    label null,
      input
        style: {padding: '0'}
        type: 'checkbox'
        onChange: (e) =>
          path = ['hideIgnored', @state.tableId]
          @_updateLocalState(path, e.target.checked)
      small null, ' Hide IGNORED'

  _renderSetColumnsType: ->
    options = _.map columnTdeTypes.concat('IGNORE').concat(''), (opKey, opValue) ->
      option
        disabled: opKey == ''
        value: opKey
        key: opKey
      ,
        opKey or small null, 'Set All Types to:'

    React.createElement Input,
      type: 'select'
      bsSize: 'small'
      defaultValue: ''
      onChange: (e) =>
        value = e.target.value
        if _.isEmpty(value)
          return
        @_prefillSelectedType(value)
      options

  _prefillSelectedType: (value) ->
    editingColumns = @_geteditingColumns()
    newColumns = editingColumns.map (ec) ->
      newColumn = ec.set 'type', value
      if value in _.keys(defaults)
        newColumn = newColumn.set('format', defaults[value])
      else
        newColumn = newColumn.set('format', null)
    @_handleEditChange(newColumns)

  _handleEditChange: (data) ->
    path = ['editing', @state.tableId]
    @_updateLocalState(path, data)

  _geteditingColumns: ->
    @state.localState.getIn(['editing', @state.tableId])

  _updateLocalState: (path, data) ->
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState, path)
  _updateLocalStateDirectly: (newLocalState) ->
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState)
