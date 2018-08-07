React = require 'react'
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require '../../components/TableSizeLabel')
DeleteButton = require '../../../../../react/common/DeleteButton'
OutputMappingModal = require('../../modals/OutputMapping').default
actionCreators = require '../../../ActionCreators'
Immutable = require 'immutable'

{span, div, a, button, i, h4, small, em, code} = React.DOM

OutputMappingRow = React.createClass(
  displayName: 'OutputMappingRow'
  mixins: [ImmutableRenderMixin]

  propTypes:
    outputMapping: React.PropTypes.object.isRequired
    mappingIndex: React.PropTypes.number.isRequired
    editingOutputMapping: React.PropTypes.object.isRequired
    editingId: React.PropTypes.string.isRequired
    transformation: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    buckets: React.PropTypes.object.isRequired
    bucket: React.PropTypes.object.isRequired
    pendingActions: React.PropTypes.object.isRequired
    definition: React.PropTypes.object,
    otherOutputMappings: React.PropTypes.object
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
                if @props.definition.has('label')
                  @props.definition.get('label')
                else
                  if @props.transformation.get('backend') == 'docker'
                    'out/tables/' + @props.outputMapping.get 'source'
                  else
                    @props.outputMapping.get 'source'
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-6', key: 'destination'},
                TableSizeLabel
                  size: @props.tables.getIn [@props.outputMapping.get('destination'), 'dataSizeBytes']
                ' '
                if @props.outputMapping.get 'incremental'
                  span {className: 'label label-default'},
                    'Incremental'
                if @props.outputMapping.get('destination') != ''
                  @props.outputMapping.get('destination')
                else
                  'Not set'
            ]
          else
            [
              span {className: 'td col-xs-4', key: 'soruce'},
                if @props.transformation.get('backend') == 'docker'
                  'out/tables/' + @props.outputMapping.get 'source'
                else
                  @props.outputMapping.get 'source'
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-3', key: 'buttons'},
                TableSizeLabel
                  size: @props.tables.getIn [@props.outputMapping.get('destination'), 'dataSizeBytes']
                ' '
                if @props.outputMapping.get 'incremental'
                  span {className: 'label label-default'},
                    'Incremental'
              span {className: 'td col-xs-3', key: 'destination'},
                @props.outputMapping.get('destination')
            ]
          span {className: 'td col-xs-1 col-xs-1 text-right kbc-no-wrap'},
            if (@props.outputMapping.get('destination') != '' && !@props.disabled)
              React.createElement DeleteButton,
                tooltip: 'Delete Output'
                isPending: @props.pendingActions.get('delete-output-' + @props.mappingIndex)
                confirm:
                  title: 'Delete Output'
                  text: span null,
                    "Do you really want to delete the output mapping for "
                    code null,
                      @props.outputMapping.get('destination')
                    "?"
                  onConfirm: @_handleDelete
            if (!@props.disabled)
              React.createElement OutputMappingModal,
                transformationBucket: this.props.bucket
                mode: 'edit'
                tables: @props.tables
                buckets: @props.buckets
                backend: @props.transformation.get("backend")
                type: @props.transformation.get("type")
                mapping: @props.editingOutputMapping
                onChange: @_handleChange
                onCancel: @_handleCancel
                onSave: @_handleSave
                definition: @props.definition
                otherOutputMappings: @props.otherOutputMappings

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
      'output'
      @props.editingId
      @props.mappingIndex
    )

  _handleDelete: ->
    actionCreators.deleteTransformationMapping(@props.bucket.get('id'),
      @props.transformation.get('id')
      'output'
      @props.mappingIndex
    )
)

module.exports = OutputMappingRow
