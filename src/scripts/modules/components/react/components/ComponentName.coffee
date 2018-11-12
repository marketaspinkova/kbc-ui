React = require 'react'
createComponentEditClass = require './ComponentEditField'
InlineEditTextInput = require('../../../../react/common/InlineEditTextInput').default
ComponentEditField = require './ComponentEditField'

module.exports = React.createClass
  displayName: 'ComponentName'
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired
  render: ->
    React.createElement ComponentEditField,
      componentId: @props.componentId
      configId: @props.configId
      fieldName: 'name'
      editElement: InlineEditTextInput
      placeholder: 'My Configuration'
      tooltipPlacement: 'bottom'
