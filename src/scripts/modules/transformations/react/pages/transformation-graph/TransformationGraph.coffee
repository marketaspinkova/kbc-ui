React = require('react')
Router = require 'react-router'

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
TransformationsStore  = require('../../../stores/TransformationsStore').default
TransformationBucketsStore  = require('../../../stores/TransformationBucketsStore').default
StorageTablesStore  = require('../../../../components/stores/StorageTablesStore')
RoutesStore = require '../../../../../stores/RoutesStore'
TransformationsActionCreators = require '../../../ActionCreators'
GraphContainer = React.createFactory(require './GraphContainer')

{div, span, ul, li, a, em, h2} = React.DOM

TransformationGraph = React.createClass
  displayName: 'TransformationGraph'

  mixins: [
    createStoreMixin(TransformationsStore, TransformationBucketsStore, StorageTablesStore),
    Router.Navigation
  ]

  getStateFromStores: ->
    bucketId = RoutesStore.getCurrentRouteParam 'config'
    transformationId = RoutesStore.getCurrentRouteParam 'row'
    bucket: TransformationBucketsStore.get(bucketId)
    transformation: TransformationsStore.getTransformation(bucketId, transformationId)
    pendingActions: TransformationsStore.getPendingActions(bucketId)
    tables: StorageTablesStore.getAll()
    bucketId: bucketId
    transformationId: transformationId
    transformations: TransformationsStore.getTransformations(bucketId)

  render: ->
    div className: 'container-fluid',
      div className: 'col-md-12 kbc-main-content',
        div {className: 'kbc-row'},
          GraphContainer
            bucketId: @state.bucketId
            transformationId: @state.transformationId
            disabled: @state.transformation.get("disabled", false)

module.exports = TransformationGraph
