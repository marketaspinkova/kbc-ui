React = require 'react'
_ = require 'underscore'
createStoreMixin = require '../../../../react/mixins/createStoreMixin'
WrDbStore = require '../../store'
RoutesStore = require '../../../../stores/RoutesStore'
ActionCreators = require '../../actionCreators'
{Navigation} = require 'react-router'
InstalledComponentsStore = require '../../../components/stores/InstalledComponentsStore'
InstalledComponentsActions = require '../../../components/InstalledComponentsActionCreators'
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
{States} = require '../pages/credentials/StateConstants'
credentialsTemplates = require('../../templates/credentialsFields').default
{isProvisioningCredentials} = require '../../provisioningUtils'
{button, span} = React.DOM

module.exports = (componentId, driver, isProvisioning) ->
  React.createClass templateFn(componentId, driver, isProvisioning)

templateFn = (componentId, driver, isProvisioning) ->
  displayName: 'CredentialsHeaderButtons'
  mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore), Navigation]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam 'config'
    currentCredentials = WrDbStore.getCredentials componentId, configId
    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    credsState = localState.get 'credentialsState'
    isEditing = !! WrDbStore.getEditingByPath(componentId, configId, 'creds')
    isProvisionedCreds = isProvisioningCredentials(driver, currentCredentials)
    editingCredentials = WrDbStore.getEditingByPath(componentId, configId, 'creds')

    #state
    editingCredsValid: @_hasDbConnection(editingCredentials)
    currentCredentials: currentCredentials
    currentConfigId: configId
    isEditing: !! WrDbStore.getEditingByPath(componentId, configId, 'creds')
    isSaving: credsState == States.SAVING_NEW_CREDS
    localState: localState
    isProvisionedCreds: !isEditing && isProvisionedCreds

  _handleEditStart: ->
    creds = @state.currentCredentials
    creds = creds?.set 'driver', driver
    creds = @_getDefaultValues(creds)
    creds = creds.map((value, key) ->
      isHashed = key[0] == '#'
      if isHashed
        return ''
      else
        return value
    )
    #ActionCreators.resetCredentials componentId, @state.currentConfigId
    ActionCreators.setEditingData componentId, @state.currentConfigId, 'creds', creds
    @_updateLocalState('credentialsState', States.CREATE_NEW_CREDS)

  _handleResetStart: ->
    @_updateLocalState('credentialsState', States.INIT)

  _handleCancel: ->
    if @state.isProvisionedCreds
      @_updateLocalState('credentialsState', States.INIT)
    else
      ActionCreators.setEditingData componentId, @state.currentConfigId, 'creds', null
      @_updateLocalState('credentialsState', States.SHOW_STORED_CREDS)


  _handleCreate: ->
    @_updateLocalState('credentialsState', States.SAVING_NEW_CREDS)
    editingCredentials =  WrDbStore.getEditingByPath(componentId, @state.currentConfigId, 'creds')
    editingCredentials = editingCredentials.map((value, key) =>
      isHashed = key[0] == '#'
      if isHashed and _.isEmpty(value)
        return @state.currentCredentials.get(key)
      else
        return value
    )
    ActionCreators
    .saveCredentials(componentId, @state.currentConfigId, editingCredentials).then =>
      @_updateLocalState('credentialsState', States.SHOW_STORED_CREDS)
      RoutesStore.getRouter().transitionTo(componentId, config: @state.currentConfigId)

  render: ->
    state = @state.localState.get 'credentialsState'

    if state in [States.SHOW_STORED_CREDS]
      return React.DOM.div null,
        if isProvisioning
          button
            className: 'btn btn-link'
            disabled: @state.isSaving
            onClick: @_handleResetStart
          ,
            span className: 'fa fa-fw fa-times'
            ' Reset Credentials'
        if !@state.isProvisionedCreds
          button
            className: 'btn btn-success'
            disabled: @state.isSaving
            onClick: @_handleEditStart
          ,
            span className: 'fa fa-edit'
            ' Edit Credentials'

    if state in [States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS]
      return React.DOM.div null,
        if @state.isSaving
          Loader()
        button
          className: 'btn btn-link'
          disabled: @state.isSaving
          onClick: @_handleCancel
        ,
          'Cancel'
        button
          className: 'btn btn-success'
          disabled: @state.isSaving or (not @state.editingCredsValid)
          onClick: @_handleCreate
        ,
          'Save'
    else
      return null

  _updateLocalState: (path, data) ->
    if _.isString path
      path = [path]
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.currentConfigId, newLocalState, path)


  _hasDbConnection: (credentials) ->
    fields = credentialsTemplates(componentId)
    result = _.reduce(fields, (memo, field) ->
      propName = field[1]
      isHashed = propName[0] == '#'
      isRequired = field[6]
      memo and (!isRequired || !!credentials.get(propName) or isHashed)
    !!credentials)
    return result

  _getDefaultPort: ->
    fields = credentialsTemplates(componentId)
    for field in fields
      if field[1] == 'port'
        return field[4]
    return ''

  _getDefaultValues: (credentials) ->
    fields = credentialsTemplates(componentId)
    for field in fields
      if !!field[4]
        credentials = credentials?.set(field[1], credentials.get(field[1], field[4]))

    return credentials
