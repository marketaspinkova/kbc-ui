React = require 'react'
ImmutableRenderMixin = require 'react-immutable-render-mixin'
{Input} = require('./../../../../../../react/common/KbcBootstrap')
{ ListGroup, ListGroupItem } = require('react-bootstrap')
Input = React.createFactory Input
Button = React.createFactory(require('react-bootstrap').Button)
ListGroup = React.createFactory ListGroup
ListGroupItem = React.createFactory ListGroupItem
Select = React.createFactory(require('react-select').default)
_ = require('underscore')

module.exports = React.createClass
  displayName: 'SnowflakeDataTypesAddForm'
  mixins: [ImmutableRenderMixin]

  propTypes:
    datatypes: React.PropTypes.object.isRequired
    columnValue: React.PropTypes.string.isRequired
    datatypeValue: React.PropTypes.string.isRequired
    sizeValue: React.PropTypes.string.isRequired
    columnsOptions: React.PropTypes.array.isRequired
    datatypeOptions: React.PropTypes.array.isRequired
    disabled: React.PropTypes.bool.isRequired
    showSize: React.PropTypes.bool.isRequired

    handleAddDataType: React.PropTypes.func.isRequired
    columnOnChange: React.PropTypes.func.isRequired
    datatypeOnChange: React.PropTypes.func.isRequired
    sizeOnChange: React.PropTypes.func.isRequired

    availableColumns: React.PropTypes.array.isRequired

  _handleSizeOnChange: (e) ->
    @props.sizeOnChange(e.target.value)

  _getDatatypeOptions: ->
    _.map(@props.datatypeOptions, (datatype) ->
      {
        label: datatype
        value: datatype
      }
    )

  _convertEmptyValuesToNullOnChange: (e) ->
    @props.convertEmptyValuesToNullOnChange(e.target.checked)

  render: ->
    React.DOM.div {className: "well"},
      React.DOM.div {className: "row"},
        React.DOM.span {className: "col-xs-4"},
          Select
            name: 'add-column'
            value: @props.columnValue
            disabled: @props.disabled
            placeholder: "Column"
            onChange: @props.columnOnChange
            options: @props.availableColumns
        React.DOM.span {className: "col-xs-4"},
          Select
            name: 'add-datatype'
            value: @props.datatypeValue
            disabled: @props.disabled
            placeholder: "Datatype"
            onChange: @props.datatypeOnChange
            options: @_getDatatypeOptions()
        React.DOM.span {className: "col-xs-4"},
          Input
            type: 'text'
            name: 'add-size'
            value: @props.sizeValue
            disabled: @props.disabled || !@props.showSize
            placeholder: "Length, eg. 38,0"
            onChange: @_handleSizeOnChange
      React.DOM.div {className: "row"},
        React.DOM.span {className: "col-xs-6"},
          Input
            checked: @props.convertEmptyValuesToNullValue
            onChange: @_convertEmptyValuesToNullOnChange
            standalone: true
            type: 'checkbox'
            label: React.DOM.span {},
              'Convert empty values to '
              React.DOM.code null,
                'null'
        React.DOM.span {className: "col-xs-6 text-right"},
          Button
            className: "btn-success"
            onClick: @props.handleAddDataType
            disabled: @props.disabled || !@props.columnValue || !@props.datatypeValue
          ,
            "Create data type"
      React.DOM.div {className: "row", style: {paddingTop: "10px"}},
        React.DOM.div {className: "help-block col-xs-12"},
          React.DOM.div {},
            React.DOM.code {}, "VARCHAR(255)"
            "default for primary key columns"
          React.DOM.div {},
            React.DOM.code {}, "VARCHAR NOT NULL"
            "default for all other columns"
