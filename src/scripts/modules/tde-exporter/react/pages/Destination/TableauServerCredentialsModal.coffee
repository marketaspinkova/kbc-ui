React = require 'react'
_ = require 'underscore'
{Modal} = require('react-bootstrap')
{button, strong, div, h2, span, h4, section, p} = React.DOM
ApplicationStore = require('../../../../../stores/ApplicationStore').default
{Map} = require 'immutable'
{Loader} = require '@keboola/indigo-ui'
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)

Button = React.createFactory(require('react-bootstrap').Button)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
RouterStore = require('../../../../../stores/RoutesStore').default
{i, span, div, p, strong, form, input, label, div} = React.DOM
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)

module.exports = React.createClass
  displayName: 'TableauServerCredentialsModal'

  propTypes:
    saveCredentialsFn: React.PropTypes.func.isRequired

  getInitialState: ->
    credentials: @props.credentials or Map()
    isSaving: false


  render: ->
    show = !!@props.localState?.get('show')
    React.createElement Modal,
      show: show
      onHide: =>
        @props.updateLocalState(Map())
    ,
      ModalHeader closeButton: true,
        ModalTitle null,
          'Setup Credentials to Tableau Server'
      div className: 'form form-horizontal',
        ModalBody null,
          @_createInput('Server URL', 'server_url', 'text', 'use url of your concrete instance, \
          e.g. https://10az.online.tableau.com')
          @_createInput('Username', 'username')
          @_createInput('Password', 'password', 'password')
          @_createInput('Project Name', 'project_name')
          @_createInput('Site', 'site')

        ModalFooter null,
          ButtonToolbar null,
            if @state.isSaving
              React.createElement Loader
            Button
              onClick: =>
                @props.updateLocalState(Map())
              bsStyle: 'link'
            ,
              'Cancel'
            Button
              bsStyle: 'success'
              disabled: not @_isValid() or @state.isSaving
              onClick: =>
                @setState
                  isSaving: true
                creds = @state.credentials
                safeCreds = creds.set('#password', creds.get('password'))
                safeCreds = safeCreds.remove('password')
                @props.saveCredentialsFn(safeCreds).then =>
                  @setState
                    isSaving: false
                    credentials: safeCreds
                  @props.updateLocalState(Map())
            ,
              span null,
                'Save '
  _isValid: ->
    @state.credentials and
      not _.isEmpty(@state.credentials.get('server_url')) and
      not _.isEmpty(@state.credentials.get('username')) and
      not _.isEmpty(@state.credentials.get('project_name')) and
      not _.isEmpty(@state.credentials.get('password'))


  _createInput: (labelValue, propName, type = 'text', desc = '') ->
    sitePlaceholder = 'default if empty'
    Input
      label: labelValue
      help: desc
      placeholder: sitePlaceholder if propName == 'site'
      type: type
      value: @state.credentials.get propName
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
      onChange: (event) =>
        value = event.target.value
        credentials = @state.credentials.set(propName, value)
        @setState
          credentials: credentials
