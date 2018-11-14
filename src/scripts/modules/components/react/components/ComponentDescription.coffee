React = require 'react'
InlineEditTextArea = require('../../../../react/common/InlineEditArea').default
ComponentEditField = require './ComponentEditField'

module.exports = React.createClass
  displayName: 'ComponentDescription'
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired
    placeholder: React.PropTypes.string

  getDefaultProps: ->
    placeholder: 'Description'

  render: ->
    React.createElement ComponentEditField,
      componentId: @props.componentId
      configId: @props.configId
      fieldName: 'description'
      editElement: InlineEditTextArea
      placeholder: @props.placeholder
