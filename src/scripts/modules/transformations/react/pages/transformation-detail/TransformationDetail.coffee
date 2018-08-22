React = require('react')
Link = React.createFactory(require('react-router').Link)
Router = require 'react-router'
Immutable = require 'immutable'
classnames = require 'classnames'

TransformationDetailStatic = React.createFactory(require './TransformationDetailStatic')

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
TransformationsStore  = require('../../../stores/TransformationsStore')
TransformationBucketsStore  = require('../../../stores/TransformationBucketsStore')
StorageTablesStore = require('../../../../components/stores/StorageTablesStore')
StorageBucketsStore = require('../../../../components/stores/StorageBucketsStore')
ApplicationStore = require('../../../../../stores/ApplicationStore')
RoutesStore = require '../../../../../stores/RoutesStore'
VersionsStore = require('../../../../components/stores/VersionsStore')
TransformationsActionCreators = require '../../../ActionCreators'
RunComponentButton = React.createFactory(require '../../../../components/react/components/RunComponentButton')
ActivateDeactivateButton = React.createFactory(require('../../../../../react/common/ActivateDeactivateButton').default)
{Confirm, Loader} = require '../../../../../react/common/common'
CreateSandboxButton = require('../../components/CreateSandboxButton').default

SqlDepButton = React.createFactory(require('../../components/SqlDepButton').default)
ValidateQueriesButton = React.createFactory(require('../../components/ValidateQueriesButton').default)
sandboxUtils = require('../../../utils/sandboxUtils')

LatestRowVersions = React.createFactory(
  require('../../../../configurations/react/components/SidebarRowVersionsWrapper').default
)

{div, span, ul, li, a, em} = React.DOM

module.exports = React.createClass
  displayName: 'TransformationDetail'

  mixins: [
    createStoreMixin(TransformationsStore,
    TransformationBucketsStore, StorageTablesStore, StorageBucketsStore, VersionsStore),
    Router.Navigation, Router.State
  ]

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    bucketId = RoutesStore.getCurrentRouteParam 'config'
    transformationId = RoutesStore.getCurrentRouteParam 'row'
    versions = VersionsStore.getVersions('transformation', bucketId)
    latestVersionId = versions.map((v) -> v.get('version')).max()
    if RoutesStore.getRouter().getCurrentQuery().highlightQueryNumber
      highlightQueryNumber = parseInt(RoutesStore.getRouter().getCurrentQuery().highlightQueryNumber)
    bucket: TransformationBucketsStore.get(bucketId)
    transformation: TransformationsStore.getTransformation(bucketId, transformationId)
    editingFields: TransformationsStore.getTransformationEditingFields(bucketId, transformationId)
    pendingActions: TransformationsStore.getTransformationPendingActions(bucketId, transformationId)
    tables: StorageTablesStore.getAll()
    buckets: StorageBucketsStore.getAll()
    bucketId: bucketId
    transformationId: transformationId
    openInputMappings: TransformationsStore.getOpenInputMappings(bucketId, transformationId)
    openOutputMappings: TransformationsStore.getOpenOutputMappings(bucketId, transformationId)
    transformations: TransformationsStore.getTransformations(bucketId)
    isTransformationEditingValid: TransformationsStore.getTransformationEditingIsValid(
      bucketId, transformationId
    )
    highlightQueryNumber: highlightQueryNumber
    latestVersionId: latestVersionId

  getInitialState: ->
    validateModalOpen: false

  resolveLinkDocumentationLink: ->
    documentationLink = "https://help.keboola.com/manipulation/transformations/"
    transformationType = @state.transformation.get('type')

    if transformationType == 'simple'
      subpageName = @state.transformation.get('backend')
    else
      subpageName = transformationType

    return documentationLink + subpageName

  _deleteTransformation: ->
    bucketId = @state.bucket.get('id')
    @transitionTo 'transformationBucket',
      config: bucketId
    transformationId = @state.transformation.get('id')
    TransformationsActionCreators.deleteTransformation(bucketId, transformationId)

  _handleActiveChange: (newValue) ->
    if (newValue)
      changeDescription = "Transformation " + @state.transformation.get("name") + " enabled"
    else
      changeDescription = "Transformation " + @state.transformation.get("name") + " disabled"
    TransformationsActionCreators.changeTransformationProperty(
      @state.bucketId,
      @state.transformationId,
      'disabled',
      !newValue,
      changeDescription
    )

  _showDetails: ->
    @state.transformation.get('backend') == 'mysql' and @state.transformation.get('type') == 'simple' or
    @state.transformation.get('backend') == 'redshift' and @state.transformation.get('type') == 'simple' or
    @state.transformation.get('backend') == 'snowflake' and @state.transformation.get('type') == 'simple' or
    @state.transformation.get('backend') == 'docker'

  render: ->
    backend = @state.transformation.get('backend')
    transformationType = @state.transformation.get('type')
    bucketId = @state.bucketId
    latestVersionId = @state.latestVersionId
    div className: 'container-fluid',
      div className: 'col-md-9 kbc-main-content',
          TransformationDetailStatic
            bucket: @state.bucket
            transformation: @state.transformation
            editingFields: @state.editingFields
            transformations: @state.transformations
            pendingActions: @state.pendingActions
            tables: @state.tables
            buckets: @state.buckets
            bucketId: @state.bucketId
            transformationId: @state.transformationId
            openInputMappings: @state.openInputMappings
            openOutputMappings: @state.openOutputMappings
            showDetails: @_showDetails()
            isEditingValid: @state.isTransformationEditingValid
            isQueriesProcessing: @state.pendingActions.has 'queries-processing'
            highlightQueryNumber: @state.highlightQueryNumber
            highlightingQueryDisabled: @state.validateModalOpen
      div className: 'col-md-3 kbc-main-sidebar',
        ul className: 'nav nav-stacked',
          li {},
            Link
              to: 'transformationDetailGraph'
              params: {row: @state.transformation.get("id"), config: @state.bucket.get('id')}
            ,
              span className: 'fa fa-search fa-fw'
              ' Overview'
          li className: classnames(disabled: @state.transformation.get('disabled')),
            RunComponentButton(
              title: "Run transformation"
              component: 'transformation'
              mode: 'link'
              disabled: @state.transformation.get('disabled')
              disabledReason: if @state.transformation.get('disabled') then 'Transformation is disabled' else ''
              runParams: =>
                configBucketId: @state.bucketId
                transformations: [@state.transformation.get('id')]
            ,
              "You are about to run the transformation #{@state.transformation.get('name')}."
            )
          li {},
            ActivateDeactivateButton
              mode: 'link'
              activateTooltip: 'Enable transformation'
              deactivateTooltip: 'Disable transformation'
              isActive: !@state.transformation.get('disabled')
              isPending: @state.pendingActions.has 'save-disabled'
              onChange: @_handleActiveChange

          if sandboxUtils.hasSandbox(backend, transformationType)
            li {},
              React.createElement CreateSandboxButton,
                backend: backend,
                transformationType: transformationType,
                runParams: sandboxUtils.generateRunParameters(@state.transformation, bucketId, latestVersionId)

          if backend == 'redshift' or
              backend == 'mysql' && transformationType == 'simple' or
              backend == 'snowflake'
            li {},
              SqlDepButton
                backend: backend
                bucketId: @state.bucketId
                transformationId: @state.transformationId

          if backend == 'snowflake'
            li {},
              ValidateQueriesButton
                backend: backend
                bucketId: @state.bucketId
                transformationId: @state.transformationId
                modalOpen: @state.validateModalOpen
                onModalOpen: =>
                  @setState({validateModalOpen: true})
                onModalClose: =>
                  @setState({validateModalOpen: false})
                isSaved: !@state.editingFields.get('queriesChanged', false)
          li {},
            a {},
              React.createElement Confirm,
                text: 'Delete transformation'
                title: "Do you really want to delete the transformation #{@state.transformation.get('name')}?"
                buttonLabel: 'Delete'
                buttonType: 'danger'
                onConfirm: @_deleteTransformation
              ,
                span {},
                  span className: 'fa kbc-icon-cup fa-fw'
                  ' Delete transformation'
          li {},
            a {href: @resolveLinkDocumentationLink()}
            ,
              span className: 'fa fa-question-circle fa-fw'
              ' Documentation'
        LatestRowVersions
          componentId: 'transformation'
          configId: @state.bucketId
          rowId: @state.transformationId

