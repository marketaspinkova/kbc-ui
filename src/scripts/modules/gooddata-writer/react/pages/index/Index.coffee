React = require 'react'
{Map, List} = require 'immutable'
Promise = require('bluebird')
{GoodDataWriterTokenTypes} = require '../../../../components/Constants'
createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require '../../../../../stores/RoutesStore'
ComponentDescription = require '../../../../components/react/components/ComponentDescription'
ComponentMetadata = require '../../../../components/react/components/ComponentMetadata'
ComponentEmptyState = require('../../../../components/react/components/ComponentEmptyState').default
AddNewTableButton = require('../../components/AddNewTableButton').default
ApplicationStore = require '../../../../../stores/ApplicationStore'
StorageTablesStore = require '../../../../components/stores/StorageTablesStore'

SearchBar = require('@keboola/indigo-ui').SearchBar
TablesList = require './BucketTablesList'
TableRow = require './TableRow'
TablesByBucketsPanel = require '../../../../components/react/components/TablesByBucketsPanel'
{Protected} = require '@keboola/indigo-ui'

ActiveCountBadge = require './ActiveCountBadge'
{Link} = require('react-router')
Confirm = require('../../../../../react/common/Confirm').default
{Loader} = require '@keboola/indigo-ui'

LatestJobs = require '../../../../components/react/components/SidebarJobs'
LatestJobsStore = require '../../../../jobs/stores/LatestJobsStore'
LatestVersions = React.createFactory(require('../../../../components/react/components/SidebarVersionsWrapper').default)
InstalledComponentStore = require '../../../../components/stores/InstalledComponentsStore'
goodDataWriterStore = require '../../../store'
actionCreators = require '../../../actionCreators'
installedComponentsActions = require '../../../../components/InstalledComponentsActionCreators'
ComponentsStore = require '../../../../components/stores/ComponentsStore'

{label, small, strong, br, ul, li, div, span, i, a, button, p, form, input} = React.DOM
{ Panel, Alert, DropdownButton } = require('react-bootstrap')

module.exports = React.createClass
  displayName: 'GooddDataWriterIndex'
  mixins: [createStoreMixin(goodDataWriterStore, InstalledComponentStore, StorageTablesStore, LatestJobsStore)]

  getStateFromStores: ->
    config =  RoutesStore.getCurrentRouteParam('config')
    localState = InstalledComponentStore.getLocalState('gooddata-writer', config)
    writer = goodDataWriterStore.getWriter(config)

    configId: config
    writer: writer
    pid: writer.getIn(['config', 'project', 'id'])
    tablesByBucket: goodDataWriterStore.getWriterTablesByBucket(config)
    filter: goodDataWriterStore.getWriterTablesFilter(config)
    deletingTables: goodDataWriterStore.getDeletingTables(config)
    localState: localState
    latestJobs: LatestJobsStore.getJobs 'gooddata-writer', config
    storageTables: StorageTablesStore.getAll()

  _handleFilterChange: (query) ->
    actionCreators.setWriterTablesFilter(@state.writer.getIn(['config', 'id']), query)

  _renderAddNewTable: ->
    remainingTables = @state.storageTables.filter (table) =>
      table.getIn(['bucket', 'stage']) in ['out', 'in'] and not @state.tablesByBucket.has(table.get('id'))

    React.createElement AddNewTableButton,
      isDisabled: remainingTables.count() == 0
      configuredTables: @state.tablesByBucket
      localState: @state.localState.get('newTable', Map())
      addNewTableFn: (tableId, data) =>
        actionCreators.addNewTable(@state.configId, tableId, data).then =>
          actionCreators.saveTableField(@state.configId, tableId, 'export', true).then =>
            RoutesStore.getRouter().transitionTo('gooddata-writer-table',
              config: @state.configId
              table: tableId
          )
      updateLocalStateFn: (path, data) =>
        @_updateLocalState(['newTable'].concat(path), data)

  render: ->
    writer = @state.writer.get 'config'
    # console.log writer?.toJS()
    div className: 'container-fluid',
      div className: 'col-md-9 kbc-main-content',
        div className: 'kbc-inner-padding kbc-inner-padding-with-bottom-border',
          React.createElement ComponentDescription,
            componentId: 'gooddata-writer'
            configId: writer.get 'id'

        if writer.get('info')
          div className: 'row',
            React.createElement Alert,
              bsStyle: 'warning'
            ,
              writer.get('info')
        if not writer.get('project')
          div className: 'row',
            React.createElement Alert,
              bsStyle: 'warning'
            ,
              'No GoodData project assigned with this configuration.'
        if @state.tablesByBucket.count()
          div className: 'row-searchbar',
            React.createElement SearchBar,
              onChange: @_handleFilterChange
              query: @state.filter
        if @state.tablesByBucket.count()
          div null,
            div className: 'kbc-inner-padding text-right',
              @_renderAddNewTable()
            @_renderTablesByBucketsPanel()
        else
          @_renderNotFound()



      div className: 'col-md-3 kbc-main-sidebar',
        div className: 'kbc-buttons kbc-text-light',
          React.createElement ComponentMetadata,
            componentId: 'gooddata-writer'
            configId: @state.configId
        div null,
          @_renderGoodDataTokenInfo()
        ul className: 'nav nav-stacked',
          li null,
            React.createElement Link,
              to: 'gooddata-writer-date-dimensions'
              params:
                config: writer.get 'id'
            ,
              span className: 'fa fa-clock-o fa-fw'
              ' Date Dimensions'
          li null,
            React.createElement Link,
              to: 'jobs'
              query:
                q: '+component:gooddata-writer +params.config:' + writer.get('id')
            ,
              span className: 'fa fa-tasks fa-fw'
              ' Jobs Queue'
          li null,
            React.createElement Confirm,
              text: 'Upload project'
              title: 'Are you sure you want to upload all tables to the GoodData project?'
              buttonLabel: 'Upload'
              buttonType: 'success'
              onConfirm: @_handleProjectUpload
              childrenRootElement: React.DOM.a
            ,
              if @state.writer.get('pendingActions', List()).contains 'uploadProject'
                React.createElement Loader, className: 'fa-fw'
              else
                span className: 'fa fa-upload fa-fw'
              ' Upload project'

          li null,
            React.createElement Link,
              to: 'gooddata-writer-model'
              params:
                config: @state.writer.getIn ['config', 'id']
            ,
              span className: 'fa fa-sitemap fa-fw'
              ' Model'

        if writer.get('project')
          ul className: 'nav nav-stacked',
            if writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete')
              li null,
                form
                  target: '_blank noopener noreferrer'
                  method: 'POST'
                  action: @_getGoodDataLoginUrl()
                ,
                  input type: 'hidden', name: 'encryptedClaims', value: writer.getIn(['project', 'encryptedClaims'])
                  input type: 'hidden', name: 'ssoProvider', value: writer.getIn(['project', 'ssoProvider'])
                  input type: 'hidden', name: 'targetUrl', value: "/#s=/gdc/projects/#{@state.pid}|projectDashboardPage"
                  button type: 'submit', className: 'btn btn-link',
                    span className: 'fa fa-bar-chart-o fa-fw'
                    ' GoodData Project'

            li null,
              if writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete')
                a
                  onClick: @_handleProjectAccessDisable
                ,
                  if @state.writer.get('pendingActions', List()).contains 'projectAccess'
                    React.createElement Loader, className: 'fa-fw kbc-loader'
                  else
                    span className: 'fa fa-unlink fa-fw'
                  ' Disable Access to Project'
              if !writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete')
                a
                  onClick: @_handleProjectAccessEnable
                ,
                  if @state.writer.get('pendingActions', List()).contains 'projectAccess'
                    React.createElement Loader, className: 'fa-fw kbc-loader'
                  else
                    span className: 'fa fa-link fa-fw'
                  ' Enable Access to Project'
        if writer.get('project')
          ul className: 'nav nav-stacked',
            li null,
              if @state.writer.get 'isOptimizingSLI'
                span null,
                  ' '
                  React.createElement Loader
              React.createElement DropdownButton,
                title: span null,
                  i className: 'fa fa-cog fa-fw'
                  ' Advanced'
                bsStyle: 'link'
                id: 'modules-gooddata-writer-react-pages-index-index-dropdown'
              ,
                li null,
                  React.createElement Confirm,
                    title: 'Optimize SLI hash'
                    text: div null,
                      p null, 'Optimizing SLI hashes is an advanced
                      process which might damage your GD project.
                      Proceed with caution. '
                    buttonLabel: 'Optimize'
                    buttonType: 'primary'
                    onConfirm: @_handleOptimizeSLI
                    childrenRootElement: React.DOM.a
                  ,
                    span null,
                      'Optimize SLI hash'
                li null,
                  React.createElement Confirm,
                    title: 'Reset Project'
                    text: div null,
                      p null,
                        "You are about to create a new GoodData project for the writer #{writer.get('id')}. "
                        "The current GoodData project (#{@state.pid}) will be discarded. "
                        "Are you sure you want to reset the project?"
                    buttonLabel: 'Reset'
                    onConfirm: @_handleProjectReset
                    childrenRootElement: React.DOM.a
                  ,
                    span null,
                      'Reset Project'
            li null,
              React.createElement Confirm,
                title: 'Delete Writer'
                text: [
                  React.DOM.p key: 'question',
                    "Are you sure you want to delete the writer with its GoodData project?",
                  React.DOM.p key: 'warning',
                    React.DOM.i className: 'fa fa-exclamation-triangle'
                    " This is permanent and configuration can't be restored."
                ]
                buttonLabel: 'Delete'
                onConfirm: @_handleProjectDelete
                childrenRootElement: React.DOM.a
              ,
                if @state.writer.get 'isDeleting'
                  React.createElement Loader, className: 'fa-fw'
                else
                  span className: 'kbc-icon-cup fa-fw'
                ' Delete Writer'
        React.createElement LatestJobs,
          jobs: @state.latestJobs
          limit: 3

        LatestVersions
          componentId: 'gooddata-writer'
          limit: 3

  _getGoodDataLoginUrl: ->
    loginUrl = 'https://secure.gooddata.com/gdc/account/customerlogin'
    componentUri = ComponentsStore.getComponent('gooddata-writer').get('uri')
    if componentUri == 'https://syrup.eu-central-1.keboola.com/gooddata-writer'
      loginUrl = 'https://keboola.eu.gooddata.com/gdc/account/customerlogin'
    return loginUrl

  _handleBucketSelect: (bucketId, eventKey, e) ->
    actionCreators.toggleBucket(@state.writer.getIn(['config', 'id']), bucketId)

  _handleProjectUpload: ->
    actionCreators.uploadToGoodData(@state.writer.getIn(['config', 'id']))

  _handleProjectDelete: ->
    actionCreators.deleteWriter(@state.writer.getIn ['config', 'id'])

  _handleOptimizeSLI: ->
    actionCreators.optimizeSLIHash(@state.writer.getIn(['config', 'id']), @state.pid)

  _handleProjectReset: ->
    actionCreators.resetProject(@state.writer.getIn(['config', 'id']), @state.pid)

  _handleProjectAccessEnable: ->
    actionCreators.enableProjectAccess(@state.writer.getIn(['config', 'id']), @state.pid)

  _handleProjectAccessDisable: ->
    actionCreators.disableProjectAccess(@state.writer.getIn(['config', 'id']),
      @state.writer.getIn(['config', 'project', 'id']))

  _renderGoodDataTokenInfo: ->
    token = @state.writer.getIn(['config', 'project', 'authToken'])
    labelCaption = 'None'
    labelClass = 'default'
    if token
      switch token
        when GoodDataWriterTokenTypes.DEMO
          labelCaption = 'Keboola DEMO'
          labelClass = 'warning'
        when GoodDataWriterTokenTypes.PRODUCTION
          labelCaption = 'Keboola Production'
          labelClass = 'primary'
        else
          labelCaption = 'Custom'
          labelClass = 'primary'
    small null,
      'Auth Token: '
      span className: 'label label-' + labelClass,
        labelCaption
      if labelCaption == 'Custom'
        React.createElement Protected, null, token


  _renderNotFound: ->
    # div {className: 'table table-striped'},
    #   div {className: 'tfoot'},
    #     div {className: 'tr'},
    #       div {className: 'td'}, 'No tables found'

    React.createElement ComponentEmptyState,
      null
    ,
      p null, 'No tables configured.'
      @_renderAddNewTable()



  _renderBucketPanel: (bucketId, tables) ->
    activeCount = tables.filter((table) -> table.getIn(['data', 'export'])).count()
    header = span null,
      span className: 'table',
        span className: 'tbody',
          span className: 'tr',
            span className: 'td',
              bucketId
            span className: 'td text-right',
              React.createElement ActiveCountBadge,
                totalCount: tables.size
                activeCount: activeCount

    React.createElement Panel,
      header: header
      key: bucketId
      eventKey: bucketId
      expanded: !!@state.filter.length || @state.writer.getIn(['bucketToggles', bucketId])
      collapsible: true
      onSelect: @_handleBucketSelect.bind(@, bucketId)
    ,
      React.createElement TablesList,
        configId: @state.writer.getIn ['config', 'id']
        tables: tables

  ###
  Tomas
  ###

  _renderTableRow: (table, isDeleted = false) ->
    #bucketId = table.getIn ['bucket', 'id']
    writerTable = @state.tablesByBucket.get table.get('id')
    React.createElement TableRow,
      table: writerTable
      configId: @state.configId
      sapiTable: table
      deleteTableFn: @_deleteTable
      isDeleting: @state.deletingTables.get(table.get('id'))
      isDeleted: isDeleted

  _renderHeaderRow: ->
    div className: 'tr',
      span className: 'th',
        strong null, 'Table name'
      span className: 'th',
        strong null, 'GoodData title'
      span className: 'th'

  _renderTablesByBucketsPanel: ->
    React.createElement TablesByBucketsPanel,
      renderTableRowFn: @_renderTableRow
      renderHeaderRowFn: @_renderHeaderRow
      filterFn: @_filterBuckets
      searchQuery: @state.filter
      isTableExportedFn: @_isTableExported
      onToggleBucketFn: @_handleBucketSelect
      isBucketToggledFn: (bucketId) =>
        @state.writer.getIn(['bucketToggles', bucketId])
      showAllTables: false
      isTableShownFn: @_isTableShown
      configuredTables: @state.tablesByBucket.keySeq().toJS()
      renderDeletedTableRowFn: (table) =>
        @_renderTableRow(table, true)


  _filterBuckets: (buckets) ->
    buckets = buckets.filter (bucket) ->
      bucket.get('stage') in ['out', 'in']
    return buckets

  _isTableExported: (tableId) ->
    @state.tablesByBucket.find (table) ->
      table.get('id') == tableId and table.getIn ['data', 'export']

  _isTableShown: (tableId) ->
    @state.tablesByBucket.find (table) ->
      table.get('id') == tableId

  _deleteTable: (tableId) ->
    actionCreators.deleteTable(@state.configId, tableId)


  _updateLocalState: (path, data) ->
    newState = @state.localState.setIn(path, data)
    installedComponentsActions.updateLocalState('gooddata-writer', @state.configId, newState, path)


  _oldTablesList: ->
    div
      className: 'kbc-accordion kbc-panel-heading-with-table el-heading-with-table'
    ,
      @state.tablesByBucket.map (tables, bucketId) ->
        @_renderBucketPanel bucketId, tables
      , @
      .toArray()
