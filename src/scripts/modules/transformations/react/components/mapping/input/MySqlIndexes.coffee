React = require 'react'
ImmutableRenderMixin = require '../../../../../../react/mixins/ImmutableRendererMixin'
Button = React.createFactory(require('react-bootstrap').Button)
Select = React.createFactory(require('react-select').default)
_ = require('underscore')

module.exports = React.createClass
  displayName: 'MySqlIndexes'
  mixins: [ImmutableRenderMixin]

  propTypes:
    indexes: React.PropTypes.object.isRequired
    selectValue: React.PropTypes.object.isRequired
    columnsOptions: React.PropTypes.array.isRequired
    disabled: React.PropTypes.bool.isRequired
    selectOnChange: React.PropTypes.func.isRequired
    handleAddIndex: React.PropTypes.func.isRequired
    handleRemoveIndex: React.PropTypes.func.isRequired

  _handleSelectOnChange: (selected) ->
    @props.selectOnChange(_.pluck(selected, "value"))

  render: ->
    component = @
    React.DOM.span {},
      React.DOM.div {className: "well"},
        if !@props.indexes.count()
          React.DOM.div {}, "No indexes set."
        else
          React.DOM.div {className: "tags-list"}
          @props.indexes.map((index, key) ->
            React.DOM.span {key: key},
              React.DOM.span {className: 'label label-default'},
                index.toArray().join(', ')
                ' '
                React.DOM.span
                  className: "kbc-icon-cup kbc-cursor-pointer"
                  onClick: ->
                    component.props.handleRemoveIndex(key)
              ' '
          , @).toArray()
      React.DOM.div {className: "row"},
        React.DOM.div {className: "col-xs-9"},
          Select
            multi: true
            name: 'add-indexes'
            value: @props.selectValue.toJS()
            disabled: @props.disabled
            placeholder: "Select column(s) to create an index"
            onChange: @_handleSelectOnChange
            options: @props.columnsOptions
        React.DOM.div {className: "col-xs-3 kbc-col-button"},
          Button
            className: "btn-success"
            onClick: @props.handleAddIndex
            disabled: @props.disabled || @props.selectValue.count() == 0
          ,
            "Create Index"
