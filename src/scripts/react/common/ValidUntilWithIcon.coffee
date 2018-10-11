React = require 'react'
ValidUntil = React.createFactory(require('./ValidUntil').default)
date = require '../../utils/date'

{span, i} = React.DOM

ValidUntilWithIcon = React.createClass
  propTypes:
    validUntil: React.PropTypes.number

  render: ->
    span title: date.format(@props.validUntil),
      i {className: 'fa fa-calendar'}
      ' '
      ValidUntil
        validUntil: @props.validUntil

module.exports = ValidUntilWithIcon
