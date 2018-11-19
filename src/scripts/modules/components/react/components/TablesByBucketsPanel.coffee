React = require 'react'
fuzzy = require 'fuzzy'
{fromJS, List} = require 'immutable'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
ActiveCountBadge = require('./ActiveCountBadge').default
storageTablesStore = require('../../stores/StorageTablesStore').default
storageActionCreators = require '../../StorageActionCreators'
{strong, br, ul, li, div, span, i, a, button, p} = React.DOM
{Panel} = require('react-bootstrap')

module.exports = React.createClass

  displayName: 'tablesByBucketsPanel'

  mixins: [createStoreMixin(storageTablesStore)]

  propTypes:
    renderTableRowFn: React.PropTypes.func.isRequired
    renderHeaderRowFn: React.PropTypes.func
    filterFn: React.PropTypes.func
    searchQuery: React.PropTypes.string #used as filter of tables
    isTableExportedFn: React.PropTypes.func
    isTableShownFn: React.PropTypes.func # returns true/false whether
# to show table or not, overides isTableExportedFn
    onToggleBucketFn: React.PropTypes.func
    isBucketToggledFn: React.PropTypes.func
    showAllTables: React.PropTypes.bool
    configuredTables: React.PropTypes.array
    renderDeletedTableRowFn: React.PropTypes.func

  getStateFromStores: ->
    tables = storageTablesStore.getAll()
    #state
    tables: tables

  componentDidMount: ->
    setTimeout =>
      storageActionCreators.loadTables().then =>
        #force expand of the first bucket if is the only one
        tables = storageTablesStore.getAll()
        buckets = @_getFilteredBuckets(tables)
        forceExpand = buckets.count() == 1
        if forceExpand
          bucketId = buckets.keySeq().first()
          if not @_isBucketToggled(bucketId)
            @props.onToggleBucketFn bucketId


  getDefaultProps: ->
    showAllTables: true
    configuredTables: []



  render: ->
    deletedTables = @_getDeletedTables()
    buckets = @_getFilteredBuckets()
    if buckets.count()
      div null,
        div
          className: 'kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table'
        ,
          buckets.map (bucket, bucketId) ->
            @_renderBucketPanel bucketId, bucket.get('tables')
          , @
          .toArray()
        if deletedTables.count() > 0
          div null,
            div
              className: 'kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table'
              @_renderBucketPanel 'Nonexisting tables', deletedTables, @props.renderDeletedTableRowFn
    else
      @_renderNotFound()


  _renderBucketPanel: (bucketId, tables, renderRowFn = @props.renderTableRowFn) ->
    activeCount = 0
    if @props.isTableExportedFn
      activeCount = tables.filter((table) =>
        @props.isTableExportedFn(table.get('id'))
        ).count()
    header = span null,
      span className: 'table',
        span className: 'tbody',
          span className: 'tr',
            span className: 'td',
              bucketId
            if @props.isTableExportedFn and (@props.showAllTables or @props.isTableShownFn)
              span className: 'td text-right',
                React.createElement ActiveCountBadge,
                  totalCount: tables.size
                  activeCount: activeCount

    React.createElement Panel,
      header: header
      key: bucketId
      eventKey: bucketId
      expanded: (!!@props.searchQuery?.length) or (@_isBucketToggled(bucketId))
      collapsible: true
      onSelect: @_handleBucketSelect.bind(@, bucketId)
    ,
      @_renderTablesList(tables, renderRowFn)

  _renderTablesList: (tables, renderRowFn) ->
    childs = tables.map((table, index) ->
      renderRowFn(table, index)
    , @).toArray()

    header = @_renderDefaultHeaderRow()
    if @props.renderHeaderRowFn
      header = @props.renderHeaderRowFn(tables)

    div className: 'row',
      div {className: 'table table-striped table-hover table-no-margin'},
        if header
          div className: 'thead', key: 'table-header',
            header
        div {className: 'tbody', style: {'wordBreak': 'break-word'}},
          childs

  _renderDefaultHeaderRow: ->
    div className: 'tr',
      span className: 'th',
        strong null, 'Table name'

  _getTablesByBucketsList: (tables) ->
    groupedBuckets = tables.groupBy (value, key) ->
      value.getIn ['bucket','id']

    buckets = groupedBuckets.map( (bucketTables) ->
      firstTable = bucketTables.first()
      bucket = firstTable.get 'bucket'
      bucket.set('tables', bucketTables.toList())
    ).mapKeys((key, bucket) ->
      bucket.get 'id'
    )

    return buckets

  _isBucketToggled: (bucketId) ->
    togled = @props.isBucketToggledFn(bucketId)
    return togled

  _handleBucketSelect: (bucketId, eventKey, e) ->
    e.preventDefault()
    e.stopPropagation()
    @props.onToggleBucketFn bucketId

  _renderNotFound: ->
    div {className: 'table table-striped'},
      div {className: 'tfoot'},
        div {className: 'tr'},
          div {className: 'td'}, 'No tables found'

  #load buckets and tables from storage store and filter them
  _getFilteredBuckets: (tables) ->
    if not tables
      tables = @state.tables or List()
    buckets = @_getTablesByBucketsList(tables)
    if @props.filterFn
      filteredBuckets = @props.filterFn(buckets)
    else
      filteredBuckets =  buckets
    #filter according to search query
    filteredBuckets = filteredBuckets.map (bucketObject, bucketId) =>
      bucketObject.set('tables', @_filterBucketTables(bucketObject))
    filteredBuckets = filteredBuckets.filter (bucket) ->
      bucket.get('tables').count() > 0
    filteredBuckets = filteredBuckets.sortBy (bucket) ->
      bucket.get('id').toLowerCase()
    return filteredBuckets

  _filterBucketTables: (bucket) ->
    query = @props.searchQuery
    tables = bucket.get('tables')
    if not query
      query = ''
    newTables = tables.filter( (table) ->
      tableId = table.get('id')
      return fuzzy.match(query, tableId)
    )
    if not @props.showAllTables or @props.isTableShownFn
      newTables = newTables.filter( (table) =>
        tableId = table.get('id')
        isShown = if @props.isTableShownFn then @props.isTableShownFn(tableId) else false
        isExported = @props.isTableExportedFn(tableId)
        return isExported or isShown
      )
    newTables = newTables.sortBy (table) ->
      table.get('id').toLowerCase()
    return newTables

  #return tables that no longer exists but are still in the configuration
  _getDeletedTables: ->
    tables = @state.tables.keySeq().toJS()
    result = []
    for configuredTable in @props.configuredTables
      if configuredTable not in tables
        result.push
          id: configuredTable
    return fromJS result
