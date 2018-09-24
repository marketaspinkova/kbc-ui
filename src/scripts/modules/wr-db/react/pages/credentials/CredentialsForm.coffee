React = require 'react'
{Map} = require 'immutable'
Clipboard = React.createFactory(require('../../../../../react/common/Clipboard').default)
fieldsTemplates = require('../../../templates/credentialsFields').default
hasSshTunnel = require('../../../templates/hasSshTunnel').default
isDockerBasedWriter = require('../../../templates/dockerProxyApi').default
Tooltip = require('../../../../../react/common/Tooltip').default
SshTunnelRow = require('../../../../../react/common/SshTunnelRow').default
TestCredentialsButton = require '../../../../../react/common/TestCredentialsButtonGroup'
_ = require 'underscore'
contactSupport = require('../../../../../utils/contactSupport').default
{div} = React.DOM
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
StaticText = React.createFactory(require('./../../../../../react/common/KbcBootstrap').FormControls.Static)
{Protected} = require '@keboola/indigo-ui'
ApplicationStore = require '../../../../../stores/ApplicationStore'

{a, span, form, div, h2, small, label, p, option} = React.DOM


module.exports = React.createClass

  displayName: 'WrDbCredentialsForm'
  propTypes:
    isEditing: React.PropTypes.bool
    credentials: React.PropTypes.object
    savedCredentials: React.PropTypes.object
    onChangeFn: React.PropTypes.func
    changeCredentialsFn: React.PropTypes.func
    isSaving: React.PropTypes.bool
    isProvisioning: React.PropTypes.bool
    componentId: React.PropTypes.string
    configId: React.PropTypes.string
    driver: React.PropTypes.string
    testCredentialsFn: React.PropTypes.func


  render: ->
    provDescription = 'These are readonly credentials to the database provided by Keboola.'
    if @props.driver == 'redshift'
      provDescription = 'These are write credentials to the database provided by Keboola.'
    if @props.driver == 'snowflake'
      provDescription = @_snowflakeDescription()

    fields = fieldsTemplates(@props.componentId)

    form className: 'form-horizontal',
      div className: 'row kbc-header',
        div className: 'kbc-title',
          if @props.isProvisioning
            h2 null,
              'Keboola provided database credentials'
              div null,
                small null, provDescription
          else
            h2 null,
              'User specified database credentials'

      div className: 'kbc-inner-padding',
        _.map fields, (field) =>
          @_createInput(field[0], field[1], field[2], field[3], field[4], field[5], field[6], field[7])
        @_renderSshTunnelRow()
      @_renderTestCredentials()

  _openSupportModal: (e) ->
    contactSupport(type: 'project')
    e.preventDefault()
    e.stopPropagation()

  _renderContactUs: ->
    a {onClick: @_openSupportModal}, " Contact support"

  _snowflakeDescription: ->
    span null,
      'These are write credentials to the snowflake database provided by Keboola.'


  _renderTestCredentials: ->
    if not isDockerBasedWriter(@props.componentId) or @props.componentId == 'wr-db-mssql'
      return null
    React.createElement TestCredentialsButton,
      testCredentialsFn: =>
        @props.testCredentialsFn(@props.credentials)
      componentId: @props.componentId,
      configId: @props.configId,
      isEditing: @props.isEditing

  _renderSshTunnelRow: ->
    if not hasSshTunnel(@props.componentId) or @props.isProvisioning
      return null
    React.createElement SshTunnelRow,
      onChange: (newSshData) =>
        @props.changeCredentialsFn(@props.credentials.set('ssh', newSshData))
      data: @props.credentials.get('ssh', Map())
      isEditing: @props.isEditing
      disabledCheckbox: false

  _createInput: (
    labelValue,
    propName, type = 'text',
    isProtected = false,
    defaultValue = null,
    options = [],
    isRequired = false,
    helpText = null
  ) ->
    if type == 'select'
      allOptions = _.map(options, (label, value) ->
        option value: value,
          label
      )

    isHashed = propName[0] == '#'
    if @props.isProvisioning and isHashed
      propName = propName.slice(1, propName.length)
      isHashed = false

    if @props.isEditing
      if isHashed
        @_createProtectedInput(labelValue, propName, helpText)
      else
        Input
          label: @_getName(propName) or labelValue
          type: type
          disabled: @props.isSaving
          value: @props.credentials.get(propName) or defaultValue
          help: helpText
          labelClassName: 'col-xs-4'
          wrapperClassName: 'col-xs-8'
          onChange: (event) =>
            @props.onChangeFn(propName, event)
        ,
          allOptions

    else if isProtected
      @_renderProtectedNoHash(labelValue, propName)
    else
      StaticText
        label: @_getName(propName) or labelValue
        labelClassName: 'col-xs-4'
        wrapperClassName: 'col-xs-8'
      ,
        if type == 'select'
          _.find(options, (item, index) =>
            index == @props.credentials.get(propName)
          )
        else
          @_renderStaticValue(propName)
        Clipboard text: @props.credentials.get propName

  _renderStaticValue: (propName) ->
    value = @props.credentials.get(propName)
    if (this.props.componentId == 'keboola.wr-db-snowflake' && propName == 'host')
      return React.DOM.a({href: 'https://' + value, target: '_blank'}, value)
    else
      return value


  _renderProtectedNoHash: (labelValue, propName) ->
    isHashed = propName[0] == '#'
    StaticText
      label: @_getName(propName) or labelValue
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
    ,
      if isHashed
        React.createElement Tooltip,
          tooltip: 'Encrypted password',
          span className: 'fa fa-fw fa-lock', null
      else
        span null,
          React.createElement Protected, null,
            @props.credentials.get propName
          Clipboard text: @props.credentials.get propName

  _createProtectedInput: (labelValue, propName, helpText = null) ->
    savedValue = @props.savedCredentials.get(propName)
    Input
      label: @_renderProtectedLabel(labelValue, !!savedValue)
      type: 'password'
      placeholder: if savedValue then 'type new password to change it' else ''
      value: @props.credentials.get propName
      help: helpText
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
      onChange: (event) =>
        @props.onChangeFn(propName, event)

  _renderProtectedLabel: (labelValue, alreadyEncrypted) ->
    msg = "#{labelValue} will be stored securely encrypted."
    if alreadyEncrypted
      msg = msg + ' The most recently stored value will be used if left empty.'
    span null,
      labelValue
      small null,
        React.createElement Tooltip,
          placement: 'top'
          tooltip: msg,
          span className: 'fa fa-fw fa-question-circle', null

  _getName: (field) ->
    return null
    templates = fieldNames[@props.componentId]
    if templates
      return templates[field]
