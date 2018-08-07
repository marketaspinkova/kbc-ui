React = require 'react'
DeleteButton = require '../../../../../react/common/DeleteButton'
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require '../../components/TableSizeLabel')
TransformationTableTypeLabel = React.createFactory(require '../../components/TransformationTableTypeLabel')
InputMappingModal = require('../../modals/InputMapping').default
actionCreators = require '../../../ActionCreators'
Immutable = require 'immutable'

{span, div, a, button, i, h4, small, em, code} = React.DOM

module.exports = React.createClass(
  displayName: 'InputMappingRow'
  mixins: [ImmutableRenderMixin]

  propTypes:
    inputMapping: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    transformation: React.PropTypes.object.isRequired
    bucket: React.PropTypes.object.isRequired
    editingId: React.PropTypes.string.isRequired
    mappingIndex: React.PropTypes.string.isRequired
    otherDestinations: React.PropTypes.object.isRequired
    definition: React.PropTypes.object
    disabled: React.PropTypes.bool

  getDefaultProps: ->
    definition: Immutable.Map()
    disabled: false

  render: ->
    span {className: 'table', style: {wordBreak: 'break-word'}},
      span {className: 'tbody'},
        span {className: 'tr'},
          if @props.definition.has('label')
            [
              span {className: 'td col-xs-4', key: 'label'},
                @props.definition.get('label')
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-6', key: 'destination'},
                TableSizeLabel {size: @props.tables.getIn [@props.inputMapping.get('source'), 'dataSizeBytes']}
                ' '
                if @props.inputMapping.get('source') != ''
                  @props.inputMapping.get('source')
                else
                  'Not set'
              ]
          else
            [
              span {className: 'td col-xs-3', key: 'icons'},
                TableSizeLabel {size: @props.tables.getIn [@props.inputMapping.get('source'), 'dataSizeBytes']}
                ' '
              span {className: 'td col-xs-4', key: 'source'},
                @props.inputMapping.get 'source', 'Not set'
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-3', key: 'destination'},
                TransformationTableTypeLabel
                  backend: @props.transformation.get('backend')
                  type: @props.inputMapping.get('type')
                ' '
                if @props.transformation.get('backend') == 'docker'
                  'in/tables/' + @props.inputMapping.get 'destination'
                else
                  @props.inputMapping.get 'destination'
            ]
          span {className: 'td col-xs-1 text-right kbc-no-wrap'},
            if (@props.inputMapping.get('source') != '' && !@props.disabled)
              React.createElement DeleteButton,
                tooltip: 'Delete Input'
                isPending: @props.pendingActions.get('delete-input-' + @props.mappingIndex)
                confirm:
                  title: 'Delete Input'
                  text: span null,
                    "Do you really want to delete the input mapping for "
                    code null,
                      @props.inputMapping.get('source')
                    "?"
                  onConfirm: @_handleDelete
            if (!@props.disabled)
              React.createElement InputMappingModal,
                mode: 'edit'
                tables: @props.tables
                backend: @props.transformation.get("backend")
                type: @props.transformation.get("type")
                mapping: @props.editingInputMapping
                otherDestinations: @props.otherDestinations
                onChange: @_handleChange
                onCancel: @_handleCancel
                onSave: @_handleSave
                definition: @props.definition

  _handleChange: (newMapping) ->
    actionCreators.updateTransformationEditingField(@props.bucket.get('id'),
      @props.transformation.get('id')
      @props.editingId
      newMapping
    )

  _handleCancel: (newMapping) ->
    actionCreators.cancelTransformationEditingField(@props.bucket.get('id'),
      @props.transformation.get('id')
      @props.editingId
    )

  _handleSave: ->
    actionCreators.saveTransformationMapping(@props.bucket.get('id'),
      @props.transformation.get('id')
      'input'
      @props.editingId
      @props.mappingIndex
    )

  _handleDelete: ->
    actionCreators.deleteTransformationMapping(@props.bucket.get('id'),
      @props.transformation.get('id')
      'input'
      @props.mappingIndex
    )
)
