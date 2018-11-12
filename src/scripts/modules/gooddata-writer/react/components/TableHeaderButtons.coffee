React = require 'react'
{Map} = require 'immutable'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
goodDataWriterStore = require '../../store'
actionCreators = require '../../actionCreators'
RoutesStore = require('../../../../stores/RoutesStore').default
{ColumnTypes} = require '../../constants'
Loader = require('@keboola/indigo-ui').Loader
TableLoadType = React.createFactory(require './TableLoadType')

{Button} = require 'react-bootstrap'

Confirm = require('../../../../react/common/Confirm').default
PureRenderMixin = require('react-addons-pure-render-mixin')


{ ButtonGroup, DropdownButton, MenuItem } = require 'react-bootstrap'
{button, span, div} = React.DOM

module.exports = React.createClass
  displayName: 'GoodDataWriterTableButtons'
  mixins: [createStoreMixin(goodDataWriterStore), PureRenderMixin]

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    tableId = RoutesStore.getCurrentRouteParam('table')
    isEditingColumns = goodDataWriterStore.isEditingTableColumns(configId, tableId)
    writer = goodDataWriterStore.getWriter(configId)

    projectExist: !!writer.getIn(['config', 'project'])
    pid: writer.getIn ['config', 'project', 'id']
    table: goodDataWriterStore.getTable(configId, tableId)
    configurationId: configId
    columns: goodDataWriterStore.getTableColumns(configId,
      tableId,
      if isEditingColumns then 'editing' else 'current'
    )
    isEditingColumns: isEditingColumns


  _isAllColumnsIgnored: ->
    this.state.columns.reduce((memo, c) ->
      memo && c.get('type') == 'IGNORE'
    , true)

  _handleResetExportStatus: ->
    actionCreators.saveTableField @state.configurationId,
      @state.table.get 'id'
      'isExported'
      false

  _handleResetTable: ->
    actionCreators.resetTable @state.configurationId,
      @state.table.get 'id'
      @state.pid

  _handleSynchronizeTable: ->
    actionCreators.synchronizeTable @state.configurationId,
      @state.table.get 'id'
      @state.pid

  _handleUpload: ->
    actionCreators.uploadToGoodData @state.configurationId, @state.table.get('id')

  _isConnectionPoint: ->
    @state.columns and @state.columns.find((c) -> c.get('type') == ColumnTypes.CONNECTION_POINT)

  render: ->
    {ATTRIBUTE, REFERENCE, DATE} = ColumnTypes
    filteredColumns = @state.columns.filter((c) -> c.get('type') in [ATTRIBUTE, REFERENCE, DATE])
    grainColumns = if !@_isConnectionPoint() then filteredColumns else Map()
    resetExportStatusText = React.DOM.span null,
      'Are you sure you want to reset the export status of the '
      React.DOM.strong null, @state.table.getIn ['data', 'title']
      ' dataset?'

    resetTableText = React.DOM.span null,
      'You are about to remove the dataset in the GoodData project belonging
      to the table and reset its export status.
      Are you sure you want to reset the table '
      React.DOM.strong null, @state.table.getIn ['data', 'title']
      ' ?'

    uploadTableText = React.DOM.span null,
      'Are you sure you want to upload '
      @state.table.getIn ['data', 'title']
      ' to the GoodData project?'

    synchronizeTableText = React.DOM.span null,
      'Are you sure you want to execute the '
      React.DOM.a
        href: 'https://developer.gooddata.com/article/maql-ddl#synchronize'
        target: '_blank'
      ,
        'synchronize'
      ' operation on the '
      React.DOM.strong null, @state.table.getIn ['data', 'title']
      ' dataset?'

    div null,
      TableLoadType
        columns: grainColumns
        table: @state.table
        configurationId: @state.configurationId
      ' '
      React.createElement ButtonGroup, null,
        React.createElement DropdownButton,
          title: ''
          id: 'modules-gooddata-writer-react-components-table-header-buttons-dropdown',
            React.createElement MenuItem, null,
              React.createElement Confirm,
                title: 'Reset export status'
                text: resetExportStatusText
                buttonLabel: 'Reset'
                buttonType: 'success'
                onConfirm: @_handleResetExportStatus
              ,
                React.DOM.span null, 'Reset export status'
            React.createElement MenuItem, null,
              React.createElement Confirm,
                title: 'Reset table'
                text: resetTableText
                buttonLabel: 'Reset'
                buttonType: 'success'
                onConfirm: @_handleResetTable
              ,
                React.DOM.span null, 'Reset table'
            React.createElement MenuItem, null,
              React.createElement Confirm,
                title: 'Synchronize dataset'
                text: synchronizeTableText
                buttonLabel: 'Synchronize'
                buttonType: 'success'
                onConfirm: @_handleSynchronizeTable
              ,
                React.DOM.span null, 'Synchronize dataset'
        if @state.table.get('pendingActions').contains 'uploadTable'
          React.createElement Button, null,
            React.createElement Loader, className: 'fa-fw'
            ' Upload table'
        else
          React.createElement Confirm,
            text: uploadTableText
            title: 'Upload Table'
            buttonLabel: 'Upload'
            buttonType: 'success'
            onConfirm: @_handleUpload
          ,
            React.createElement Button, disabled: @state.isEditingColumns or @_isAllColumnsIgnored(),
              span className: 'fa fa-upload fa-fw'
              ' Upload table'
