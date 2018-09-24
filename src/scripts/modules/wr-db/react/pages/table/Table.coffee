React = require 'react'
_ = require 'underscore'

{fromJS, Map, List} = require('immutable')
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'

TableNameEdit = React.createFactory require './TableNameEdit'
ColumnsEditor = React.createFactory require './ColumnsEditor'
ColumnRow = require './ColumnRow'
DataTypes = require('../../../templates/dataTypes').default
{Check, Loader} = require '@keboola/indigo-ui'

storageApi = require '../../../../components/StorageApi'

WrDbStore = require '../../../store'
WrDbActions = require '../../../actionCreators'
V2Actions = require('../../../v2-actions').default
RoutesStore = require '../../../../../stores/RoutesStore'
StorageTablesStore = require '../../../../components/stores/StorageTablesStore'
#Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)

EditButtons = React.createFactory(require('../../../../../react/common/EditButtons'))
InstalledComponentsActions = require '../../../../components/InstalledComponentsActionCreators'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
ActivateDeactivateButton = require('../../../../../react/common/ActivateDeactivateButton').default
FiltersDescription = require '../../../../components/react/components/generic/FiltersDescription'
IsDockerBasedFn = require('../../../templates/dockerProxyApi').default
IncrementalSetupModal = React.createFactory(require('./IncrementalSetupModal').default)

defaultDataTypes =
['INT','BIGINT',
'VARCHAR': {defaultSize: '255'},
'TEXT',
'DECIMAL': {defaultSize: '12,2'},
'DATE', 'DATETIME'
]

{option, select, p, span, button, strong, div, ul, li} = React.DOM


module.exports = (componentId) ->
  React.createClass templateFn(componentId)

templateFn = (componentId) ->
  displayName: "WrDbTableDetail"
  mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore, StorageTablesStore)]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('tableId')
    tableConfig = WrDbStore.getTableConfig(componentId, configId, tableId)
    storageTableColumns = StorageTablesStore.getAll().getIn [tableId, 'columns'], List()
    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    tablesExportInfo = WrDbStore.getTables(componentId, configId)
    exportInfo = tablesExportInfo.find((tab) ->
      tab.get('id') == tableId)
    isUpdatingTable = WrDbStore.isUpdatingTable(componentId, configId, tableId)
    editingData = WrDbStore.getEditing(componentId, configId)
    editingColumns = editingData.getIn ['columns', tableId]
    isSavingColumns = !!WrDbStore.getUpdatingColumns(componentId, configId, tableId)
    hideIgnored = localState.getIn ['hideIgnored', tableId], false
    v2Actions = V2Actions(configId, componentId)
    columnsValidation = editingData.getIn(['validation', tableId], Map())

    #state
    allTables: StorageTablesStore.getAll()
    columnsValidation: columnsValidation
    hideIgnored: hideIgnored
    editingColumns: editingColumns
    editingData: editingData
    isUpdatingTable: isUpdatingTable
    tableConfig: tableConfig
    columns: @_prepareColumns(tableConfig.get('columns'), storageTableColumns)
    tableId: tableId
    configId: configId
    localState: localState
    exportInfo: exportInfo
    isSavingColumns: isSavingColumns
    v2Actions: v2Actions
    v2State: localState.get('v2', Map())
    v2ConfigTable: v2Actions.configTables.find((t) -> t.get('tableId') == tableId)

  getInitialState: ->
    dataPreview: null

  _prepareColumns: (configColumns, storageColumns) ->
    configColumnsNamesSet = configColumns.map((c) -> c.get('name')).toSet()
    deletedColumns = configColumnsNamesSet.subtract(storageColumns)
    allColumns = storageColumns.concat(deletedColumns)
    allColumns.map (storageColumn) ->
      configColumnFound = configColumns.find( (cc) -> cc.get('name') == storageColumn)
      if configColumnFound
        configColumnFound
      else
        fromJS
          name: storageColumn
          dbName: storageColumn
          type: 'IGNORE'
          null: false
          default: ''
          size: ''

  componentDidMount: ->
    # if @state.columns.reduce(
    #   (memo, value) ->
    #     memo and value.get('type') == 'IGNORE'
    # , true)
    #   @_handleEditColumnsStart()
    tableId = RoutesStore.getCurrentRouteParam('tableId')
    component = @
    storageApi
    .tableDataPreview tableId,
      limit: 10
    .then (csv) ->
      component.setState
        dataPreview: csv


  render: ->
    isRenderIncremental = IsDockerBasedFn(componentId) and componentId != 'wr-db-mssql'
    tableEditClassName = 'col-sm-12'
    if isRenderIncremental
      tableEditClassName = 'col-sm-4'
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        div className: 'kbc-header',
          ul className: 'list-group list-group-no-border',
            li className: 'list-group-item',
              @_renderTableEdit()
              if componentId == 'keboola.wr-thoughtspot'
                li className: 'list-group-item',
                  @_renderThoughSpotTypeInput()
              if isRenderIncremental
                li className: 'list-group-item',
                  @_renderIncrementalSetup()
              if isRenderIncremental
                li className: 'list-group-item',
                  @_renderTableFiltersRow()
              if isRenderIncremental
                li className: 'list-group-item',
                  @_renderPrimaryKey()

        ColumnsEditor
          onToggleHideIgnored: (e) =>
            path = ['hideIgnored', @state.tableId]
            @_updateLocalState(path, e.target.checked)
          dataTypes: @_getComponentDataTypes()
          columns: @state.columns
          renderRowFn: @_renderColumnRow
          editingColumns: @state.editingColumns
          isSaving: @state.isSavingColumns
          editColumnFn: @_onEditColumn
          columnsValidation: @state.columnsValidation
          filterColumnsFn: @_hideIgnoredFilter
          filterColumnFn: @_filterColumn
          dataPreview: @state.dataPreview
          editButtons: @_renderEditButtons()
          setAllColumnsType: @_renderSetColumnsType()
          disabledColumnFields: @_getDisabledColumnFields()
          onSetAllColumnsNull: (e) =>
            value = if e.target.checked then '1' else '0'
            @state.editingColumns.map (ec) =>
              newColumn = ec.set 'null', value
              @_onEditColumn(newColumn)


  _setValidateColumn: (cname, isValid) ->
    path = ['validation', @state.tableId, cname]
    WrDbActions.setEditingData(componentId, @state.configId, path, isValid)

  _validateColumn: (column) ->
    type = column.get 'type'
    size = column.get 'size'
    dbName = column.get 'dbName'
    valid = true
    if _.isString(@_getSizeParam(type)) and _.isEmpty(size)
      valid = false
    if _.isEmpty(dbName)
      valid = false
    @_setValidateColumn(column.get('name'), valid)

  showIncrementalSetupModal: ->
    @state.v2Actions.updateV2State(['IncrementalSetup', 'show'], true)

  _renderIncrementalSetup: ->
    exportInfo = @state.v2ConfigTable
    v2State = @state.v2State
    isIncremental = exportInfo.get('incremental')
    primaryKey = exportInfo.get('primaryKey', List())
    showIncrementalSetupPath = ['IncrementalSetup', 'show']
    tableMapping = @state.v2Actions.getTableMapping(@state.tableId)
    div className: 'row',
      div className: 'col-sm-3',
        strong null,
          'Load Type'
      div className: 'col-sm-9',
        button
          className: 'btn btn-link'
          style: {'paddingTop': 0, 'paddingBottom': 0}
          disabled: !!@state.editingColumns
          onClick: @showIncrementalSetupModal
          if isIncremental then 'Incremental Load' else 'Full Load'
          ' '
          span className: 'kbc-icon-pencil'
        IncrementalSetupModal
          isSaving: @state.v2State.get('savingIncremental', false)
          show: v2State.getIn(showIncrementalSetupPath, false)
          onHide: => @state.v2Actions.updateV2State(showIncrementalSetupPath, false)
          currentPK: primaryKey.join(',')
          currentMapping: tableMapping
          columns: @state.columns.map (c) ->
            c.get('dbName')
          isIncremental: isIncremental
          allTables: @state.allTables
          onSave: (isIncremental, primaryKey, newMapping, customFieldsValues) =>
            @state.v2Actions.updateV2State('savingIncremental', true)
            finishSaving =  => @state.v2Actions.updateV2State('savingIncremental', false)
            newExportInfo = exportInfo
              .set('primaryKey', primaryKey)
              .set('incremental', isIncremental)
              .mergeDeep(customFieldsValues)

            @setV2TableInfo(newExportInfo).then =>
              if newMapping != tableMapping
                @state.v2Actions.setTableMapping(newMapping).then(finishSaving)
              else
                finishSaving()
          customFieldsValues: @_getCustomFieldsValues()
          componentId: componentId

  _renderPrimaryKey: ->
    exportInfo = @state.v2ConfigTable
    primaryKey = exportInfo.get('primaryKey', List())
    div className: 'row',
      div className: 'col-sm-3',
        strong null,
          'Primary Key'
      div className: 'col-sm-9',
        button
          className: 'btn btn-link'
          style: {'paddingTop': 0, 'paddingBottom': 0}
          disabled: !!@state.editingColumns
          onClick: @showIncrementalSetupModal
          primaryKey.join(', ') or 'N/A'
          ' '
          span className: 'kbc-icon-pencil'

  _renderThoughSpotTypeInput: ->
    tableType = @state.v2ConfigTable.get('type', 'standard')
    div className: 'row',
      div className: 'col-sm-3',
        strong null,
          'Table Type'
      div className: 'col-sm-9',
        button
          className: 'btn btn-link'
          style: {'paddingTop': 0, 'paddingBottom': 0}
          disabled: !!@state.editingColumns
          onClick: @showIncrementalSetupModal
          tableType.toUpperCase()
          ' '
          span className: 'kbc-icon-pencil'

  _getCustomFieldsValues: ->
    if componentId == 'keboola.wr-thoughtspot'
      return Map({type: @state.v2ConfigTable.get('type', 'standard')})

    return Map()


  _onEditColumn: (newColumn) ->
    cname = newColumn.get('name')
    path = ['columns', @state.tableId, cname]
    WrDbActions.setEditingData(componentId, @state.configId, path, newColumn)
    @_validateColumn(newColumn)

  _filterColumn: (column) ->
    not (column.get('type') == 'IGNORE' and @state.hideIgnored)

  _hideIgnoredFilter: (columns) ->
    if not columns
      return columns
    newCols = columns.filterNot (c) =>
      c.get('type') == 'IGNORE' and @state.hideIgnored
    newCols

  _renderColumnRow: (props) ->
    React.createElement ColumnRow, props


  _handleEditColumnsStart: ->
    path = ['columns', @state.tableId]
    columns = @state.columns.toMap().mapKeys (key, column) ->
      column.get 'name'
    WrDbActions.setEditingData(componentId, @state.configId, path, columns)

  _handleEditColumnsSave: ->
    #to preserve order remap according the original columns
    columns = @state.columns.map (c) =>
      @state.editingColumns.get(c.get('name'))
    WrDbActions.saveTableColumns(componentId, @state.configId, @state.tableId, columns).then =>
      @_handleEditColumnsCancel()

  _renderSetColumnsType: ->
    tmpDataTypes = @_getDataTypes()
    options = _.map tmpDataTypes.concat('IGNORE').concat(''), (opKey) ->
      option
        disabled: opKey == ''
        value: opKey
        key: opKey
      ,
        if opKey == '' then 'Set All Columns To' else opKey
    span null,
      select
        defaultValue: ''
        onChange: (e) =>
          value = e.target.value
          @state.editingColumns.map (ec) =>
            newColumn = ec.set 'type', value
            if _.isString @_getSizeParam(value)
              defaultSize = @_getSizeParam(value)
              newColumn = newColumn.set('size', defaultSize)
            else
              newColumn = newColumn.set('size', '')
            @_onEditColumn(newColumn)
        options

  _getComponentDataTypes: ->
    DataTypes[componentId]?.typesList or defaultDataTypes

  _getDisabledColumnFields: ->
    DataTypes[componentId]?.disabledFields or []

  _getSizeParam: (dataType) ->
    dtypes = @_getComponentDataTypes()
    dt = _.find dtypes, (d) ->
      _.isObject(d) and _.keys(d)[0] == dataType
    result = dt?[dataType]?.defaultSize
    return result


  _getDataTypes: ->
    dtypes = @_getComponentDataTypes()
    return _.map dtypes, (dataType) ->
      #it could be object eg {VARCHAR: {defaultSize:''}}
      if _.isObject dataType
        return _.keys(dataType)[0]
      else #or string
        return dataType

  _handleEditColumnsCancel: ->
    path = ['columns', @state.tableId]
    WrDbActions.setEditingData(componentId, @state.configId, path, null)
    @_clearValidation()

  _clearValidation: ->
    path = ['validation', @state.tableId]
    WrDbActions.setEditingData(componentId, @state.configId, path, Map())


  _renderTableEdit: ->
    div className: 'row',
      div className: 'col-sm-3',
        strong null, 'Database table name'
      div className: 'col-sm-9',
        TableNameEdit
          tableId: @state.tableId
          table: @state.table
          configId: @state.configId
          tableExportedValue: @state.exportInfo?.get('export') or false
          currentValue: @state.exportInfo?.get('name') or @state.tableId
          isSaving: @state.isUpdatingTable
          editingValue: @state.editingData.getIn(['editingDbNames', @state.tableId])
          setEditValueFn: (value) =>
            path = ['editingDbNames', @state.tableId]
            WrDbActions.setEditingData(componentId, @state.configId, path, value)
          componentId: componentId
      ' '
  _renderTableFiltersRow: ->
    tableMapping = @state.v2Actions.getTableMapping(@state.tableId)
    div className: 'row',
      div className: 'col-sm-3',
        strong null, 'Data Filter'
      div className: 'col-sm-9',
        button
          className: 'btn btn-link'
          style: {'paddingTop': 0, 'paddingBottom': 0}
          disabled: !!@state.editingColumns
          onClick: @showIncrementalSetupModal
          React.createElement FiltersDescription,
            value: tableMapping
            rootClassName: ''
          ' '
          span className: 'kbc-icon-pencil'

  _renderEditButtons: ->
    isValid = @state.columnsValidation?.reduce((memo, value) ->
      memo and value
    , true)
    hasColumns = @state.editingColumns?.reduce( (memo, c) ->
      type = c.get('type')
      type != 'IGNORE' or memo
    , false)
    div className: 'kbc-buttons pull-right',
      EditButtons
        isEditing: @state.editingColumns
        isSaving: @state.isSavingColumns
        isDisabled: not (isValid and hasColumns)
        onCancel: @_handleEditColumnsCancel
        onSave: @_handleEditColumnsSave
        onEditStart: @_handleEditColumnsStart
        editLabel: 'Edit Columns'

  setV2TableInfo: (newTableInfo) ->
    @state.v2Actions.setTableInfo(@state.tableId, newTableInfo)

  _updateLocalState: (path, data) ->
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState)
