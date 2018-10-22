React = require 'react'
_ = require 'underscore'
{List} = require 'immutable'

Button = React.createFactory(require('react-bootstrap').Button)
{Loader} = require('@keboola/indigo-ui')
Markdown = React.createFactory(require('./Markdown').default)
Textarea = React.createFactory(require('react-textarea-autosize').default)

{div, span, textarea, button, a} = React.DOM

StaticArea = React.createFactory React.createClass
  displayName: 'InlineEditAreaStatic'
  propTypes:
    text: React.PropTypes.string
    placeholder: React.PropTypes.string
    editTooltip: React.PropTypes.string
    onCancel: React.PropTypes.func
    onEditStart: React.PropTypes.func

  render: ->
    props = _.omit @props, 'text'
    span null,
      div props,
        if @props.text
          [
            div
              key: 'button-div'
              className: 'text-right',
                button
                  className: 'btn btn-link'
                  onClick: @props.onEditStart
                ,
                  span className: 'kbc-icon-pencil'
                  ' '
                  @props.placeholder

            div key: 'markdown-div',
              Markdown
                source: @props.text
                escapeHtml: true
          ]
        else
          div
            className: 'text-right'
          ,
            button
              className: 'btn btn-link'
              onClick: @props.onEditStart
            ,
              span className: 'kbc-icon-pencil'
              ' '
              @props.placeholder



EditArea = React.createFactory React.createClass
  displayName: 'InlineEditAreaEdit'
  propTypes:
    text: React.PropTypes.string
    isSaving: React.PropTypes.bool
    placeholder: React.PropTypes.string
    onCancel: React.PropTypes.func
    onSave: React.PropTypes.func
    onChange: React.PropTypes.func

  _onChange: (e) ->
    @props.onChange e.target.value

  render: ->
    div className: 'form-inline kbc-inline-edit kbc-inline-textarea',
      Textarea
        autoFocus: true
        value: @props.text
        disabled: @props.isSaving
        placeholder: @props.placeholder
        onChange: @_onChange
        className: 'form-control'
        minRows: 2
      span className: 'kbc-inline-edit-buttons',
        if @props.isSaving
          span null,
            React.createElement Loader
            ' '
        Button
          className: 'kbc-inline-edit-cancel'
          bsStyle: 'link'
          disabled: @props.isSaving
          onClick: @props.onCancel
        ,
          span className: 'kbc-icon-cross'
        Button
          className: 'kbc-inline-edit-submit'
          bsStyle: 'info'
          disabled: @props.isSaving
          onClick: @props.onSave
        ,
          'Save'
      span className: 'small help-block',
        a href: 'https://blog.ghost.org/markdown/', target: '_blank',
          'Markdown'
        ' is supported'

module.exports = React.createClass
  displayName: 'InlineEditArea'
  propTypes:
    onEditStart: React.PropTypes.func.isRequired
    onEditCancel: React.PropTypes.func.isRequired
    onEditChange: React.PropTypes.func.isRequired
    onEditSubmit: React.PropTypes.func.isRequired
    text: React.PropTypes.string
    isSaving: React.PropTypes.bool
    isEditing: React.PropTypes.bool
    editTooltip: React.PropTypes.string
    placeholder: React.PropTypes.string

  getDefaultProps: ->
    placeholder: 'Click to edit'
    editTooltip: 'Click to edit'
    isSaving: false

  render: ->
    if @props.isEditing
      EditArea
        text: @props.text
        isSaving: @props.isSaving
        placeholder: @props.placeholder
        onChange: @props.onEditChange
        onCancel: @props.onEditCancel
        onSave: @props.onEditSubmit
    else
      StaticArea
        text: @props.text
        editTooltip: @props.editTooltip
        placeholder: @props.placeholder
        onEditStart: @props.onEditStart
