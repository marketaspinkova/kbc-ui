React = require 'react'
Immutable = require 'immutable'
Link = React.createFactory(require('react-router').Link)
DeleteButton = require('../../../../../react/common/DeleteButton').default
ImmutableRenderMixin = require 'react-immutable-render-mixin'
FileOutputMappingModal = require('./FileOutputMappingModal').default

{span, div, a, button, i, h4, small, em, code} = React.DOM

module.exports = React.createClass(
  displayName: 'FileOutputMappingHeader'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    editingValue: React.PropTypes.object.isRequired
    mappingIndex: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onSave: React.PropTypes.func.isRequired
    onCancel: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    pendingActions: React.PropTypes.object.isRequired
    onEditStart: React.PropTypes.func.isRequired

  render: ->
    component = @
    span {className: 'table', style: {'word-break': 'break-word'}},
      span {className: 'tbody'},
        span {className: 'tr'},
          span {className: 'td col-xs-4'},
            'out/files/'
            @props.value.get('source')
          span {className: 'td col-xs-1'},
            span {className: 'fa fa-chevron-right fa-fw'}
          span {className: 'td col-xs-6'},
            if @props.value.get('tags').count()
              @props.value.get('tags').map((tag) ->
                span
                  className: "label kbc-label-rounded-small label-default"
                  key: tag
                ,
                  tag
              ).toArray()
            else
              'N/A'

          span {className: 'td col-xs-1 text-right kbc-no-wrap'},
            React.createElement DeleteButton,
              tooltip: 'Delete Output'
              isPending: @props.pendingActions.getIn(['output', 'files', @props.mappingIndex, 'delete'], false)
              confirm:
                title: 'Delete Output'
                text: span null,
                  "Do you really want to delete the output mapping for out/files/"
                  @props.value.get('source')
                  "?"
                onConfirm: @props.onDelete
            React.createElement FileOutputMappingModal,
              mode: 'edit'
              onEditStart: @props.onEditStart
              mapping: @props.editingValue
              onChange: @props.onChange
              onCancel: @props.onCancel
              onSave: @props.onSave

)
