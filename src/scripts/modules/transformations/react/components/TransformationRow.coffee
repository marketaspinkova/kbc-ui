React = require 'react'
Link = React.createFactory(require('react-router').Link)
Immutable = require('immutable')
ImmutableRenderMixin = require 'react-immutable-render-mixin'
InstalledComponentsActionCreators = require '../../../components/InstalledComponentsActionCreators'
RunComponentButton = React.createFactory(require '../../../components/react/components/RunComponentButton')
TransformationTypeLabel = React.createFactory(require './TransformationTypeLabel')
DeleteButton = React.createFactory(require('../../../../react/common/DeleteButton').default)
ActivateDeactivateButton = React.createFactory(require('../../../../react/common/ActivateDeactivateButton').default)
CreateSandboxButton = require('./CreateSandboxButton').default
TransformationsActionCreators = require '../../ActionCreators'
descriptionExcerpt = require('../../../../utils/descriptionExcerpt').default
TransformationStore = require('../../stores/TransformationsStore').default
sandboxUtils = require('../../utils/sandboxUtils')

{span, div, a, button, i, h4, small, em} = React.DOM

TransformationRow = React.createClass(
  displayName: 'TransformationRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    transformation: React.PropTypes.object
    latestVersionId: React.PropTypes.number
    bucket: React.PropTypes.object
    pendingActions: React.PropTypes.object
    hideButtons: React.PropTypes.bool

  buttons: ->
    buttons = []
    props = @props

    buttons.push(DeleteButton
      key: 'delete'
      tooltip: 'Delete Transformation'
      isPending: @props.pendingActions.get 'delete'
      confirm:
        title: 'Delete Transformation'
        text: "Do you really want to delete transformation #{@props.transformation.get('name')}?"
        onConfirm: @_deleteTransformation
    )
    if sandboxUtils.hasSandbox(@props.transformation.get("backend"), @props.transformation.get("type"))
      buttons.push(React.createElement CreateSandboxButton,
        key: 'create-sandbox'
        transformationType: @props.transformation.get('type')
        backend: @props.transformation.get('backend')
        mode: "button"
        runParams: sandboxUtils.generateRunParameters(@props.transformation,
        @props.bucket.get('id'), @props.latestVersionId)
    )

    buttons.push(RunComponentButton(
      key: 'run'
      title: "Run #{@props.transformation.get('name')}"
      component: 'transformation'
      mode: 'button'
      runParams: ->
        configBucketId: props.bucket.get('id')
        transformations: [props.transformation.get('id')]
    ,
      "You are about to run the transformation #{@props.transformation.get('name')}."
    ))

    buttons.push ActivateDeactivateButton
      key: 'active'
      activateTooltip: 'Enable Transformation'
      deactivateTooltip: 'Disable Transformation'
      isActive: !@props.transformation.get('disabled')
      isPending: @props.pendingActions.has 'save-disabled'
      onChange: @_handleActiveChange

    buttons

  getTransformationDescription: ->


  render: ->
    # TODO - no detail for unsupported transformations! (remote, db/snapshot, ...)
    Link
      className: 'tr'
      to: 'transformationDetail'
      params: {row: @props.transformation.get('id'), config: @props.bucket.get('id')}
    ,
      if @props.hideButtons
        [
          span {className: 'td col-xs-3', key: 'col1'},
            h4 {},
              span {className: 'label kbc-label-rounded-small label-default pull-left'},
                @props.transformation.get('phase') || 1
              ' '
              TransformationStore.getTransformationName(@props.bucket.get('id'), @props.transformation.get('id'))
          span {className: 'td col-xs-1', key: 'col2'},
            TransformationTypeLabel
              backend: @props.transformation.get 'backend'
              type: @props.transformation.get 'type'
          span {className: 'td col-xs-8', key: 'col3'},
            small {}, descriptionExcerpt(
              TransformationStore.getTransformationDescription(@props.bucket.get('id'), @props.transformation.get('id'))
            ) || em {}, 'No description'
        ]
      else
        [
          span {className: 'td col-xs-3', key: 'col1'},
            h4 {},
              span {className: 'label kbc-label-rounded-small label-default pull-left'},
                @props.transformation.get('phase') || 1
              ' '
              TransformationStore.getTransformationName(@props.bucket.get('id'), @props.transformation.get('id'))
          span {className: 'td col-xs-1', key: 'col2'},
            TransformationTypeLabel
              backend: @props.transformation.get 'backend'
              type: @props.transformation.get 'type'
          span {className: 'td col-xs-4', key: 'col3'},
            small {}, descriptionExcerpt(
              TransformationStore.getTransformationDescription(@props.bucket.get('id'), @props.transformation.get('id'))
            ) || em {}, 'No description'
          span {className: 'td text-right col-xs-4', key: 'col4'},
            @buttons()
        ]

  _deleteTransformation: ->
    # if transformation is deleted immediately view is rendered with missing bucket because of store changed
    transformationId = @props.transformation.get('id')
    bucketId = @props.bucket.get('id')
    setTimeout ->
      TransformationsActionCreators.deleteTransformation(bucketId, transformationId)

  _handleActiveChange: (newValue) ->
    transformationId = @props.transformation.get('id')
    bucketId = @props.bucket.get('id')
    if (newValue)
      changeDescription = 'Transformation ' + @props.transformation.get('name') + ' enabled'
    else
      changeDescription = 'Transformation ' + @props.transformation.get('name') + ' disabled'
    TransformationsActionCreators.changeTransformationProperty(
      bucketId,
      transformationId,
      'disabled',
      !newValue,
      changeDescription
    )
)

module.exports = TransformationRow
