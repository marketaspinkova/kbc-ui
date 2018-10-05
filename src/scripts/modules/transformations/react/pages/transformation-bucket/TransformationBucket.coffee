React = require('react')
Immutable = require('immutable')
Router = require 'react-router'

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
TransformationsStore  = require('../../../stores/TransformationsStore').default
TransformationBucketsStore  = require('../../../stores/TransformationBucketsStore').default
RoutesStore = require '../../../../../stores/RoutesStore'
TransformationRow = React.createFactory(require '../../components/TransformationRow')
ComponentDescription = React.createFactory(require '../../../../components/react/components/ComponentDescription')
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
ComponentMetadata = require '../../../../components/react/components/ComponentMetadata'
RunComponentButton = React.createFactory(require '../../../../components/react/components/RunComponentButton')
TransformationActionCreators = require '../../../ActionCreators'
Confirm = require('../../../../../react/common/Confirm').default
NewTransformationModal = require('../../modals/NewTransformation').default
LatestJobsStore = require('../../../../jobs/stores/LatestJobsStore')
SidebarJobs = require('../../../../components/react/components/SidebarJobs')
SidebarVersions = require('../../../../components/react/components/SidebarVersionsWrapper').default
VersionsStore = require('../../../../components/stores/VersionsStore')
EmptyStateBucket = React.createFactory(require('../../components/EmptyStateBucket').default)

{div, span, input, strong, form, button, h4, i, button, small, ul, li, a} = React.DOM

TransformationBucket = React.createClass
  displayName: 'TransformationBucket'
  mixins: [
    createStoreMixin(TransformationsStore, TransformationBucketsStore, LatestJobsStore, VersionsStore)
    Router.Navigation
  ]

  getStateFromStores: ->
    bucketId = RoutesStore.getCurrentRouteParam 'config'
    latestVersions = VersionsStore.getVersions('transformation', bucketId)
    latestVersionId = latestVersions.map((v) -> v.get('version')).max()

    bucketId: bucketId
    transformations: TransformationsStore.getTransformations(bucketId)
    bucket: TransformationBucketsStore.get(bucketId)
    pendingActions: TransformationsStore.getPendingActions(bucketId)
    latestJobs: LatestJobsStore.getJobs('transformation', bucketId),
    latestVersions: latestVersions
    latestVersionId: latestVersionId

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  render: ->
    state = @state
    div className: 'container-fluid',
      div className: 'col-md-9 kbc-main-content',
        div className: 'row',
            ComponentDescription
              componentId: 'transformation'
              configId: @state.bucket.get 'id'
              placeholder: 'Describe transformation bucket'
        if @state.transformations.count()
          @_renderTable()
        else
          EmptyStateBucket bucket: @state.bucket

      div className: 'col-md-3 kbc-main-sidebar',
        div className: 'kbc-buttons kbc-text-light',
          React.createElement ComponentMetadata,
            componentId: 'transformation'
            configId: @state.bucketId
        ul className: 'nav nav-stacked',
          li {},
            React.createElement(NewTransformationModal,
              bucket: @state.bucket
            )

          li {},
            RunComponentButton(
              title: 'Run transformations'
              tooltip: 'Run all transformations in bucket'
              component: 'transformation'
              mode: 'link'
              runParams: =>
                configBucketId: @state.bucketId
            ,
              "You are about to run all transformations in the bucket #{@state.bucket.get('name')}."
            )
          li {},
            a
              onClick: @_deleteTransformationBucket,
                span className: 'fa kbc-icon-cup fa-fw'
                ' Move to Trash'
        React.createElement SidebarJobs,
          jobs: @state.latestJobs
          limit: 3

        React.createElement SidebarVersions,
          componentId: "transformation"
          limit: 3

  _renderTable: ->
    div className: 'table table-striped table-hover',
      span {className: 'tbody'},
        @_getSortedTransformations().map((transformation) ->
          TransformationRow
            latestVersionId: @state.latestVersionId
            transformation: transformation
            bucket: @state.bucket
            pendingActions: @state.pendingActions.get transformation.get('id'), Immutable.Map()
            key: transformation.get 'id'
        , @).toArray()

  _getSortedTransformations: ->
    sorted = @state.transformations.sortBy((transformation) ->
      # phase with padding
      phase = ("0000" + transformation.get('phase')).slice(-4)
      name = transformation.get('name')
      phase + name.toLowerCase()
    )
    return sorted

  _deleteTransformationBucket: ->
    bucketId = @state.bucket.get('id')
    TransformationActionCreators.deleteTransformationBucket(bucketId)
    @transitionTo 'transformations'



module.exports = TransformationBucket
