React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin').default

{Link} = require('react-router')
NewComponentButton = require './NewComponentButton'

{span, button} = React.DOM

module.exports = React.createClass
  displayName: 'ComponentsHeaderButtons'
  mixins: []
  propTypes:
    type: React.PropTypes.string.isRequired
    addRoute: React.PropTypes.string.isRequired

  render: ->
    span {},
      React.createElement NewComponentButton,
        to: @props.addRoute
        text: 'New ' + @props.type[0].toUpperCase() + @props.type.substr(1)
        type: @props.type
