React = require 'react'
_ = require 'underscore'
tdeCommon = require '../../tdeCommon'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
PureRenderMixin = require('react-addons-pure-render-mixin')
{fromJS, List, Map} = require 'immutable'

RoutesStore = require '../../../../stores/RoutesStore'
storageTablesStore = require('../../../components/stores/StorageTablesStore').default
InstalledComponentsActions = require '../../../components/InstalledComponentsActionCreators'
InstalledComponentsStore = require '../../../components/stores/InstalledComponentsStore'
EditButtons = require('../../../../react/common/EditButtons').default

componentId = 'tde-exporter'
module.exports = React.createClass
  displayName: 'tdetablebuttons'

  mixins: [createStoreMixin(InstalledComponentsStore, storageTablesStore), PureRenderMixin]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('tableId')
    configData = InstalledComponentsStore.getConfigData(componentId, configId)

    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    columnsTypes = configData.getIn(['parameters', 'typedefs', tableId], Map())
    table = storageTablesStore.getAll().get(tableId)
    isSaving = InstalledComponentsStore.getSavingConfigData(componentId, configId)

    editingData = localState.getIn(['editing',tableId])
    isValid = not editingData?.reduce((memo, value) ->
      format = value?.get('format')
      memo or (value?.get('type') in ['date', 'datetime'] and _.isEmpty(format))
    , false)
    isOneColumnType = editingData?.reduce( (memo, value) ->
      memo or value?.get('type') != 'IGNORE'
    , false)
    tdeFileName = tdeCommon.getEditingTdeFileName(configData, localState, tableId)
    mapping = tdeCommon.getEditingTableMapping(configData, localState,tableId)
    fileNameValid = tdeCommon.assertTdeFileName(tdeFileName) == null
    #state
    isSaving: isSaving
    table: table
    configId: configId
    tableId: tableId
    columnsTypes: columnsTypes
    localState: localState
    configData: configData
    isEditing: !! localState.getIn(['editing',tableId])
    editingData: editingData
    isValid: isValid and isOneColumnType and fileNameValid
    tdeFileName: tdeCommon.webalizeTdeFileName(tdeFileName)
    mapping: mapping

  render: ->
    React.createElement EditButtons,
      isEditing: @state.isEditing
      isSaving: @state.isSaving
      isDisabled: not @state.isValid
      editLabel: 'Edit'
      cancelLabel: 'Cancel'
      saveLabel: 'Save'
      onCancel: @_cancel
      onSave: @_save
      onEditStart: @_editStart

  _cancel: ->
    path = ['editing', @state.tableId]
    newState = @state.localState.setIn(path, null)
    newState = newState.setIn(['editingTdeNames', @state.tableId], null)
    newState = newState.setIn(['editingMappings', @state.tableId], null)
    @setLocalState(newState, path)

  _save: ->
    updateFn = InstalledComponentsActions.saveComponentConfigData
    tableId = @state.tableId
    editingData = @state.editingData
    editingData = editingData.filter (value, column) ->
      value.get('type') not in ['IGNORE', '']
    tableToSave = fromJS
      source: tableId
      columns: editingData.keySeq().toJS()
    tableToSave = @state.mapping
      .set('source', tableId)
      .set('columns', editingData.keySeq())

    inputTables = @state.configData.getIn(['storage', 'input', 'tables'], List())
    inputTables = inputTables.filter (table) ->
      table.get('source') != tableId
    inputTables = inputTables.push tableToSave

    configData = @state.configData.setIn ['storage', 'input', 'tables'], inputTables

    typedefs = configData.getIn ['parameters', 'typedefs'], Map()
    if _.isEmpty(typedefs?.toJS())
      typedefs = Map()
    typedefs = typedefs.set(tableId, editingData)
    configData = configData.setIn ['parameters', 'typedefs'], typedefs

    #save custom tde fileNames
    configData = configData.setIn(['parameters', 'tables', tableId, 'tdename'], @state.tdeFileName)
    updateFn(componentId, @state.configId, configData).then =>
      @_cancel()
      RoutesStore.getRouter().transitionTo 'tde-exporter', {config: @state.configId}


  _editStart: ->
    prepareData = Map()
    @state.table.get('columns').forEach (column) =>
      emptyColumn = fromJS
        type: 'IGNORE'
      if @state.columnsTypes.has column
        prepareData = prepareData.set(column, @state.columnsTypes.get(column))
      else
        prepareData = prepareData.set(column, emptyColumn)

    path = ['editing', @state.tableId]
    @_updateLocalState(path, prepareData)


  _updateLocalState: (path, data) ->
    newLocalState = @state.localState.setIn(path, data)
    @setLocalState(newLocalState, path)

  setLocalState: (newLocalState, path) ->
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState, path)
