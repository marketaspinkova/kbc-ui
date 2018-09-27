React = require 'react'
Link = React.createFactory(require('react-router').Link)
DeleteButton = require('../../../../../react/common/DeleteButton').default
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require('../../../../transformations/react/components/TableSizeLabel').default)
TableOutputMappingModal = require('./TableOutputMappingModal').default
Immutable = require('immutable')

{span, div, a, button, i, h4, small, em, code} = React.DOM

module.exports = React.createClass(
  displayName: 'TableOutputMappingHeader'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    editingValue: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    buckets: React.PropTypes.object.isRequired
    mappingIndex: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onSave: React.PropTypes.func.isRequired
    onCancel: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    pendingActions: React.PropTypes.object.isRequired
    onEditStart: React.PropTypes.func.isRequired
    definition: React.PropTypes.object

  getDefaultProps: ->
    definition: Immutable.Map()

  render: ->
    component = @
    span {className: 'table', style: {'word-break': 'break-word'}},
      span {className: 'tbody'},
        span {className: 'tr'},
          if (@props.definition.get('label'))
            [
              span {className: 'td col-xs-4', key: 'label'},
                @props.definition.get('label')
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-6', key: 'destination'},
                TableSizeLabel
                  size: @props.tables.getIn [@props.value.get('destination'), 'dataSizeBytes']
                ' '
                if @props.value.get('destination') != ''
                  @props.value.get('destination')
                else
                  'Not set'
            ]
          else
            [
              span {className: 'td col-xs-4', key: 'source'},
                'out/tables/' + @props.value.get 'source'
              span {className: 'td col-xs-1', key: 'arrow'},
                span {className: 'fa fa-chevron-right fa-fw'}
              span {className: 'td col-xs-3', key: 'icons'},
                TableSizeLabel
                  size: @props.tables.getIn [@props.value.get('destination'), 'dataSizeBytes']
                ' '
              span {className: 'td col-xs-3', key: 'destination'},
                @props.value.get('destination')
            ]
          span {className: 'td col-xs-1 text-right kbc-no-wrap'},
            if (@props.value.get('destination') != '')
              React.createElement DeleteButton,
                tooltip: 'Delete Output'
                isPending: @props.pendingActions.getIn(['output', 'tables', @props.mappingIndex, 'delete'], false)
                confirm:
                  title: 'Delete Output'
                  text: span null,
                    "Do you really want to delete the output mapping for "
                    code null,
                      @props.value.get('destination')
                    "?"
                  onConfirm: @props.onDelete
            React.createElement TableOutputMappingModal,
              mode: 'edit'
              tables: @props.tables
              buckets: @props.buckets
              mapping: @props.editingValue
              onChange: @props.onChange
              onCancel: @props.onCancel
              onSave: @props.onSave
              definition: @props.definition
              onEditStart: @props.onEditStart
)
