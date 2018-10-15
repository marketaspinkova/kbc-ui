React = require 'react'
FormHeader = React.createFactory(require './FormHeader')
contactSupport = require('../../../../../utils/contactSupport').default
ComponentIcon = React.createFactory(require('../../../../../react/common/ComponentIcon').default)
ComponentName = React.createFactory(require('../../../../../react/common/ComponentName').default)

ModalHeader = React.createFactory(require('react-bootstrap').ModalHeader)
ModalBody = React.createFactory(require('react-bootstrap').ModalBody)
ModalFooter = React.createFactory(require('react-bootstrap').ModalFooter)
ModalTitle = React.createFactory(require('react-bootstrap').ModalTitle)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)

{div, form, p, h2} = React.DOM

module.exports = React.createClass
  displayName: 'ManualConfigurationForm'
  propTypes:
    component: React.PropTypes.object.isRequired
    configuration: React.PropTypes.object.isRequired
    onCancel: React.PropTypes.func.isRequired
    onClose: React.PropTypes.func.isRequired

  render: ->
    div null,
      ModalHeader
        closeButton: true
        onHide: @props.onClose
        className: "modal-configuration-header"
      ,
        div className: 'row',
          div className: 'col-xs-3',
            ComponentIcon
              component: @props.component
              className: 'modal-configuration-icon',
              size: '64'
          div className: 'col-xs-9',
            h2
              className: 'modal-configuration-title'
              ComponentName
                component: @props.component
            p null, @props.component.get 'description'
      ModalBody
        className: 'modal-configuration-body'
        div className: 'container col-md-12',
          div className: 'row',
            div className: 'col-xs-12',
              p null, @_text()
      ModalFooter null,

        ButtonToolbar null,
          Button
            bsStyle: 'link'
            onClick: @props.onClose
          ,
            'Close'
          Button
            bsStyle: 'success'
            onClick: @_contactSupport
          ,
            'Contact Support'

  _text: ->
    switch @props.component.get 'type'
      when 'writer' then 'This writer has to be configured manually, please contact our support for assistance.'
      when 'extractor' then 'This extractor has to be configured manually,
       please contact our support for assistance.'

  _contactSupport: ->
    contactSupport(
      subject: "#{@props.component.get('name')} #{@props.component.get('type')}
        configuration assistance request"
      type: "project"
    )

