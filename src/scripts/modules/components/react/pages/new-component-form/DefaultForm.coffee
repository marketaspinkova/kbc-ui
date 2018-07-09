React = require 'react'

FormHeader = React.createFactory(require './FormHeader')
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
AppVendorInfo = React.createFactory(require './AppVendorInfo')
AppUsageInfo = React.createFactory(require('./AppUsageInfo').default)
{div, p, form, label, span, h3} = React.DOM
Immutable = require('immutable')

ModalHeader = React.createFactory(require('react-bootstrap').ModalHeader)
ModalTitle = React.createFactory(require('react-bootstrap').ModalTitle)
ModalBody = React.createFactory(require('react-bootstrap').ModalBody)
ModalFooter = React.createFactory(require('react-bootstrap').ModalFooter)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
EmptyState = require('../../../react/components/ComponentEmptyState').default

module.exports = React.createClass
  displayName: 'NewComponentDefaultForm'
  propTypes:
    component: React.PropTypes.object.isRequired
    configuration: React.PropTypes.object.isRequired
    onCancel: React.PropTypes.func.isRequired
    onSave: React.PropTypes.func.isRequired
    onChange: React.PropTypes.func.isRequired
    isValid: React.PropTypes.bool.isRequired
    isSaving: React.PropTypes.bool.isRequired
    onClose: React.PropTypes.func.isRequired

  componentDidMount: ->
    #@refs.name.getInputDOMNode().focus()

  _handleChange: (propName, event) ->
    @props.onChange(@props.configuration.set propName, event.target.value)

  render: ->
    div null,
      ModalHeader
        closeButton: true
        onHide: @props.onClose
        className: "add-configuration-form"
      ,
        FormHeader
          component: @props.component
          withButtons: false
      ModalBody null,
        div className: 'container col-md-12',
          form
            className: 'form-horizontal'
            onSubmit: @_handleSubmit
          ,
            div className: 'row',
              Input
                type: 'text'
                label: 'Name'
                ref: 'name'
                autoFocus: true
                value: @props.configuration.get 'name'
                placeholder: "My #{@props.component.get('name')} #{@props.component.get('type')}"
                labelClassName: 'col-xs-3'
                wrapperClassName: 'col-xs-8'
                onChange: @_handleChange.bind @, 'name'
                disabled: @props.isSaving
              Input
                type: 'textarea'
                label: 'Description'
                value: @props.configuration.get 'description'
                labelClassName: 'col-xs-3'
                wrapperClassName: 'col-xs-8'
                onChange: @_handleChange.bind @, 'description'
                disabled: @props.isSaving
              @_renderAppUsageInfo() if @_is3rdPartyApp()
              @_renderAppVendorInfo() if @_is3rdPartyApp()
      ModalFooter null,
        ButtonToolbar null,
          if @props.isSaving
            span null,
              Loader()
              ' '
          Button
            bsStyle: 'link'
            disabled: @props.isSaving
            onClick: @props.onCancel
          ,
            'Cancel'
          Button
            bsStyle: 'success'
            disabled: !(@props.isValid and @_isLicenseAgreed()) || @props.isSaving
            onClick: @props.onSave
          ,
            'Create Configuration'

  _renderAppVendorInfo: ->
    AppVendorInfo
      component: @props.component
      licenseAgreed: @_isLicenseAgreed()
      handleAgreedLicense: @_setAgreedLicense

  _renderAppUsageInfo: ->
    div className: 'form-group',
      label className: 'control-label col-xs-2', 'License'
      div className: 'col-xs-10',
        AppUsageInfo
          component: @props.component


  _is3rdPartyApp: ->
    @props.component.get('flags').contains('3rdParty')

  _isLicenseAgreed: ->
    # if is not 3rdparty app then license is always agreed by default
    if not @_is3rdPartyApp()
      return true
    agreed = @props.configuration.get('agreed')
    return  agreed or false

  _setAgreedLicense: (checked) ->
    #@props.onChange(@props.configuration.setIn(@vendorInfoPath, newData))
    @props.onChange(@props.configuration.set 'agreed', checked)

  _handleSubmit: (e) ->
    e.preventDefault()
    if @props.isValid and @_isLicenseAgreed()
      @props.onSave()
