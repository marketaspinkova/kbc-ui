React = require 'react'

FormHeader = React.createFactory(require './FormHeader')
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)

{GoodDataWriterModes, GoodDataWriterTokenTypes} = require '../../../Constants'
ComponentIcon = React.createFactory(require('../../../../../react/common/ComponentIcon').default)
ComponentName = React.createFactory(require('../../../../../react/common/ComponentName').default)

ModalHeader = React.createFactory(require('react-bootstrap').ModalHeader)
ModalBody = React.createFactory(require('react-bootstrap').ModalBody)
ModalFooter = React.createFactory(require('react-bootstrap').ModalFooter)
ModalTitle = React.createFactory(require('react-bootstrap').ModalTitle)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)

ApplicationStore = require '../../../../../stores/ApplicationStore'
contactSupport = require('../../../../../utils/contactSupport').default

{small, label, input, div, form, h2, h3, p, span, a} = React.DOM

module.exports = React.createClass
  displayName: 'GoodDataWriterDefaultForm'
  propTypes:
    component: React.PropTypes.object.isRequired
    configuration: React.PropTypes.object.isRequired
    onCancel: React.PropTypes.func.isRequired
    onSave: React.PropTypes.func.isRequired
    onChange: React.PropTypes.func.isRequired
    isValid: React.PropTypes.bool.isRequired
    isSaving: React.PropTypes.bool.isRequired
    onClose: React.PropTypes.func.isRequired

  getInitialState: ->
    canCreateProdProject: !!ApplicationStore.getCurrentProject().getIn(['limits', 'goodData.prodTokenEnabled', 'value'])

  _handleChange: (propName, event) ->
    @props.onChange @props.configuration.set(propName, event.target.value)

  render: ->
    div null,
      ModalHeader
        className: "modal-configuration-header"
        closeButton: true
        onHide: @props.onClose
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
        ,
        form
          className: 'form-horizontal'
          onSubmit: @_handleSubmit
        ,
          Input
            type: 'text'
            label: 'Name'
            ref: 'name'
            value: @props.configuration.get 'name'
            placeholder: "My #{@props.component.get('name')}"
            labelClassName: 'col-xs-3'
            wrapperClassName: 'col-xs-9'
            onChange: @_handleChange.bind @, 'name'
            disabled: @props.isSaving
            autoFocus: true
          Input
            type: 'textarea'
            label: 'Description'
            value: @props.configuration.get 'description'
            labelClassName: 'col-xs-3'
            wrapperClassName: 'col-xs-9'
            onChange: @_handleChange.bind @, 'description'
            disabled: @props.isSaving
          Input
            type: 'radio'
            label: 'Create new GoodData project'
            name: 'mode'
            value: GoodDataWriterModes.NEW
            checked: @props.configuration.get('mode') == GoodDataWriterModes.NEW
            onChange: @_handleChange.bind @, 'mode'
            wrapperClassName: 'col-xs-offset-3 col-xs-9'
          Input
            type: 'radio'
            name: 'mode'
            value: GoodDataWriterModes.EXISTING
            label: 'Use existing GoodData project'
            checked: @props.configuration.get('mode') == GoodDataWriterModes.EXISTING
            onChange: @_handleChange.bind @, 'mode'
            wrapperClassName: 'col-xs-offset-3 col-xs-9'
          if @props.configuration.get('mode') == GoodDataWriterModes.NEW
            @_renderNewForm()
          else
            @_renderExistingForm()

          @_renderCustomDomainForm()

          p null,
            'By creating a config, you agree with the '
            a
              href: 'http://www.gooddata.com/terms-of-use'
              target: '_blank'
              'GoodData terms and conditions.'

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
            disabled: !(@props.isValid) || @props.isSaving
            onClick: @props.onSave
          ,
            'Create Configuration'

  _renderCustomDomainForm: ->
    div null,
      div className: 'form-group',
        div className: 'col-xs-offset-3 col-xs-9',
          div className: 'checkbox',
            label null,
              input
                type: 'checkbox'
                checked: @props.configuration.get('customDomain')
                onChange: =>
                  @props.onChange(@props.configuration.set('customDomain', !@props.configuration.get('customDomain')))
              ' Custom Domain'
      if @props.configuration.get('customDomain')
        div null,
          @_renderInput("Name", "domain", "Name of your domain")
          @_renderInput("Login", "username", "Login of domain administrator")
          @_renderInput("Password", "password", "Password of domain administrator", true)
          @_renderInput("Backend url", "backendUrl", "https://secure.gooddata.com")
          div className: 'form-group',
            div className: 'col-sm-offset-3 col-sm-9',
              h3 null,
                'Custom SSO'
          @_renderInput("Provider", "ssoProvider", "optional")
          @_renderInput("PGP Key", "ssoKey", "private key encoded in base64")
          @_renderInput("Key Passphrase", "ssoKeyPass", "optional")


  _renderInput: (label, prop, placeholder, isProtected) ->
    Input
      type: if isProtected then 'password' else 'text'
      label: label
      value: @props.configuration.get(prop)
      placeholder: placeholder
      labelClassName: 'col-xs-3'
      wrapperClassName: 'col-xs-9'
      onChange: @_handleChange.bind @, prop
      disabled: @props.isSaving


  _renderNewForm: ->
    div null,
      div className: 'form-group',
        div className: 'col-xs-offset-3 col-xs-9',
          h3 null, 'Auth token'
      Input
        type: 'radio'
        label: 'Production'
        help: @_renderProductionHelp()
        name: 'tokenType'
        value: GoodDataWriterTokenTypes.PRODUCTION
        checked: @props.configuration.get('authToken') == GoodDataWriterTokenTypes.PRODUCTION
        onChange: @_handleChange.bind @, 'authToken'
        wrapperClassName: 'col-xs-offset-3 col-xs-9'
        disabled: !@state.canCreateProdProject
      Input
        type: 'radio'
        label: 'Demo'
        help: 'max 1GB of data, expires in 1 month'
        name: 'tokenType'
        value: GoodDataWriterTokenTypes.DEMO
        checked: @props.configuration.get('authToken') == GoodDataWriterTokenTypes.DEMO
        onChange: @_handleChange.bind @, 'authToken'
        wrapperClassName: 'col-xs-offset-3 col-xs-9'
      Input
        type: 'radio'
        label: 'Custom'
        help: 'You have your own token'
        name: 'tokenType'
        value: ''
        checked: @_isCustomToken()
        onChange: @_handleChange.bind @, 'authToken'
        wrapperClassName: 'col-xs-offset-3 col-xs-9'
      if @_isCustomToken()
        Input
          type: 'text'
          placeholder: 'Your token'
          value: @props.configuration.get('authToken')
          onChange: @_handleChange.bind @, 'authToken'
          wrapperClassName: 'col-xs-offset-3 col-xs-9'

  _isCustomToken: ->
    isDemo = @props.configuration.get('authToken') == GoodDataWriterTokenTypes.DEMO
    isProduction = @props.configuration.get('authToken') == GoodDataWriterTokenTypes.PRODUCTION
    return !isDemo  && !isProduction

  _renderProductionHelp: ->
    span null,
      'You are paying for it'
      if !@state.canCreateProdProject
        div null,
          'Please '
          a onClick: contactSupport,
            'contact support'
          ' to enable production project.'

  _renderExistingForm: ->
    div null,
      div className: 'col-xs-offset-3 col-xs-9',
        h3 null, 'GoodData Project Admin Credentials'

      Input
        type: 'text'
        label: 'Username'
        value: @props.configuration.get 'username'
        labelClassName: 'col-xs-3'
        wrapperClassName: 'col-xs-9'
        onChange: @_handleChange.bind @, 'username'
        disabled: @props.isSaving or @props.configuration.get('customDomain')
        placeholder: if @props.configuration.get('customDomain') then 'Will be copied from custom domain Login'
      Input
        type: 'password'
        label: 'Password'
        value: @props.configuration.get 'password'
        labelClassName: 'col-xs-3'
        wrapperClassName: 'col-xs-9'
        onChange: @_handleChange.bind @, 'password'
        disabled: @props.isSaving or @props.configuration.get('customDomain')
        placeholder: if @props.configuration.get('customDomain') then 'Will be copied from custom domain Password'
      Input
        type: 'text'
        label: 'Project Id'
        value: @props.configuration.get 'pid'
        labelClassName: 'col-xs-3'
        wrapperClassName: 'col-xs-9'
        onChange: @_handleChange.bind @, 'pid'
        disabled: @props.isSaving
      div className: 'form-group',
        div className: 'col-xs-offset-3 col-xs-9',
          label null,
            input
              type: 'checkbox'
              checked: @props.configuration.get('readModel')
              onChange: (e) =>
                @props.onChange @props.configuration.set('readModel', e.target.checked)
            ' Read project model to writer configuration'
          p className: 'help-block',
            'If checked, data bucket '
            React.DOM.code null, 'out.c-wr-gooddata-{writer_name}'
            ' will be created  along with the configuration. The bucket cannot exist already.'

  _handleSubmit: (e) ->
    e.preventDefault()
    if @props.isValid
      @props.onSave()
