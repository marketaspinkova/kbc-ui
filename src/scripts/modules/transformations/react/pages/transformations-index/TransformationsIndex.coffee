React = require('react')
Immutable = require('immutable')
fuzzy = require 'fuzzy'


TransformationBucketRow = React.createFactory(require './TransformationBucketRow')
TransformationsList = require './TransformationsList'
TransformationActionCreators = require '../../../ActionCreators'
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
TransformationBucketsStore = require('../../../stores/TransformationBucketsStore').default
TransformationsStore = require('../../../stores/TransformationsStore').default
InstalledComponentsStore = require('../../../../components/stores/InstalledComponentsStore')
SearchBar = require('@keboola/indigo-ui').SearchBar
EmptyStateIndex = require('../../components/EmptyStateIndex').default

{Panel} = require('react-bootstrap')

NewTransformationBucketButton = require '../../components/NewTransformationBucketButton'

{div, span, input, strong, form, button, h4, h2, i, button, small, ul, li, a, p} = React.DOM
TransformationsIndex = React.createClass
  displayName: 'TransformationsIndex'
  mixins: [createStoreMixin(TransformationBucketsStore, TransformationsStore, InstalledComponentsStore)]

  getStateFromStores: ->
    buckets: TransformationBucketsStore.getAll()
    toggles: TransformationBucketsStore.getToggles()
    pendingActions: TransformationBucketsStore.getPendingActions()
    filter: TransformationBucketsStore.getTransformationBucketsFilter()
    transformationsInBuckets: TransformationsStore.getAllTransformations()
    transformationPendingActions: TransformationsStore.getAllPendingActions()

  _handleFilterChange: (query) ->
    TransformationActionCreators.setTransformationBucketsFilter(query)

  render: ->
    div className: 'container-fluid',
      if (@state.buckets && @state.buckets.count() > 0)
        div className: 'kbc-main-content',
          div className: 'row-searchbar',
            React.createElement SearchBar,
              onChange: @_handleFilterChange
              query: @state.filter
          span {},
            if @_getFilteredBuckets().count()
              div className: 'kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table'
              ,
                @_getFilteredBuckets().map (bucket) ->
                  @_renderBucketPanel bucket
                , @
                .toArray()
            else
              div className: 'kbc-header',
                div className: 'kbc-title',
                  h2 null,
                    'No buckets or transformations found.'
      else
        div className: 'kbc-main-content',
          React.createElement EmptyStateIndex


  _renderEmptyState: ->
    div className: 'kbc-header',
      div className: 'kbc-title',
        h2 null,
          'No buckets or transformations found.'

  _renderBucketPanel: (bucket) ->
    header = span null,
      span className: 'table',
        TransformationBucketRow
          bucket: bucket
          transformations: TransformationsStore.getTransformations(bucket.get('id'))
          description: TransformationBucketsStore.get(bucket.get('id')).get 'description'
          pendingActions: @state.pendingActions.get(bucket.get('id'), Immutable.Map())
          key: bucket.get 'id'

    React.createElement Panel,
      header: header
      key: bucket.get("id")
      eventKey: bucket.get("id")
      expanded: !!@state.filter.length || @state.toggles.getIn([bucket.get("id")])
      collapsible: true
      onSelect: @_handleBucketSelect.bind(@, bucket.get("id"))
    ,
      React.createElement TransformationsList,
        bucket: bucket
        transformations: @_getFilteredTransformations(bucket.get('id'))
        pendingActions: @state.transformationPendingActions.getIn([bucket.get('id')], Immutable.Map())

  _handleBucketSelect: (bucketId, eventKey, e) ->
    e.preventDefault()
    e.stopPropagation()
    TransformationActionCreators.toggleBucket bucketId

  _getFilteredBuckets: ->
    filtered = @state.buckets
    if @state.filter && @state.filter != ''
      filter = @state.filter
      component = @
      filtered = @state.buckets.filter (bucket) ->
        fuzzy.match(filter, bucket.get('name', '').toString()) or
          fuzzy.match(filter, bucket.get('id', '').toString()) or
          fuzzy.match(filter, bucket.get('description', '').toString()) or
          component._getFilteredTransformations(bucket.get('id')).count()

    filtered = filtered.sortBy((bucket) ->
      bucket.get('name').toLowerCase()
    )
    return filtered

  _getFilteredTransformations: (bucketId) ->
    filtered = @state.transformationsInBuckets.getIn([bucketId], Immutable.Map())
    if @state.filter && @state.filter != ''
      filter = @state.filter
      filtered = @state.transformationsInBuckets.getIn([bucketId], Immutable.Map()).filter((transformation) ->
        fuzzy.match(filter, transformation.get('name', '').toString()) or
          fuzzy.match(filter, transformation.get('description', '').toString()) or
          fuzzy.match(filter, transformation.get('fullId', '').toString()) or
          fuzzy.match(filter, transformation.get('id', '').toString())
      )

    filtered = filtered.sortBy((transformation) ->
      # phase with padding
      phase = ("0000" + transformation.get('phase')).slice(-4)
      name = transformation.get('name', '')
      phase + name.toLowerCase()
    )
    return filtered


module.exports = TransformationsIndex
