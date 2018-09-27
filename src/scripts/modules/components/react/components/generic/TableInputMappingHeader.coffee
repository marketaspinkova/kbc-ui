React = require 'react'
DeleteButton = require('../../../../../react/common/DeleteButton').default
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require('../../../../transformations/react/components/TableSizeLabel').default)
TableInputMappingModal = require('./TableInputMappingModal').default
Immutable = require('immutable')

{span, div, a, button, i, h4, small, em, code} = React.DOM

module.exports = React.createClass(
  displayName: 'TableInputMappingHeader'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    editingValue: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    mappingIndex: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onSave: React.PropTypes.func.isRequired
    onCancel: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    pendingActions: React.PropTypes.object.isRequired
    onEditStart: React.PropTypes.func.isRequired
    otherDestinations: React.PropTypes.object.isRequired
    definition: React.PropTypes.object

  getDefaultProps: ->
    definition: Immutable.Map()

  render: ->
    component = @
    span {className: 'table', style: {'word-break': 'break-word'}},
      span {className: 'tbody'},
        span {className: 'tr'},
          if @props.definition.has('label')
            [
              span {className: 'td col-xs-4', key: 'label'},
                @props.definition.get('label')
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}

              span {className: 'td col-xs-6', key: 'source'},
                TableSizeLabel {size: @props.tables.getIn [@props.value.get('source'), 'dataSizeBytes']}
                ' '
                if @props.value.get('source') != ''
                  @props.value.get('source')
                else
                  'Not set'
            ]
          else
            [
              span {className: 'td col-xs-3', key: 'icons'},
                TableSizeLabel {size: @props.tables.getIn [@props.value.get('source'), 'dataSizeBytes']}
                ' '
              span {className: 'td col-xs-4', key: 'source'},
                @props.value.get 'source'
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-3', key: 'destination'},
                'in/tables/' + @props.value.get('destination', @props.value.get('source'))
            ]
          span {className: 'td col-xs-1 text-right kbc-no-wrap'},
            if (@props.value.get('source') != '')
              React.createElement DeleteButton,
                tooltip: 'Delete Input'
                isPending: @props.pendingActions.getIn(['input', 'tables', @props.mappingIndex, 'delete'], false)
                confirm:
                  title: 'Delete Input'
                  text: span null,
                    "Do you really want to delete the input mapping for "
                    code null,
                      @props.value.get('source')
                    "?"
                  onConfirm: @props.onDelete

            React.createElement TableInputMappingModal,
              mode: 'edit'
              tables: @props.tables
              mapping: @props.editingValue
              onChange: @props.onChange
              onCancel: @props.onCancel
              onSave: @props.onSave
              onEditStart: component.props.onEditStart
              otherDestinations: @props.otherDestinations
              definition: @props.definition
)
