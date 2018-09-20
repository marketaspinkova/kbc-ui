React = require 'react'
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
List = require('immutable').List

{div, label, ul, li, p, span, strong, address, a, br, em, table, tr, td, h2} = React.DOM
module.exports = React.createClass
  displayName: 'appVendorInfo'
  propTypes:
    component: React.PropTypes.object.isRequired
    licenseAgreed: React.PropTypes.bool.isRequired
    handleAgreedLicense: React.PropTypes.func.isRequired

  render: ->
    div className: 'form-group',
      div className: 'col-xs-9 col-xs-offset-3',
        Input
          type: 'checkbox'
          label: @_renderCheckboxLabel()
          checked: @props.licenseAgreed
          onChange: (event) =>
            @props.handleAgreedLicense(event.target.checked)

  _renderCheckboxLabel: ->
    licenseUrl = @props.component.getIn(['data', 'vendor', 'licenseUrl'], null)
    msg = 'I agree with these terms and conditions'
    if not licenseUrl
      return "#{msg}."
    else
      span null,
        "#{msg} and with "
        a {href: licenseUrl, target: '_blank'}, "vendor license terms and conditions"
        "."