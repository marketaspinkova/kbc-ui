React = require 'react'
_ = require 'underscore'
{fromJS} = require 'immutable'
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
ApplicationStore = require '../../../../../stores/ApplicationStore'

{States} = require './StateConstants'
WrDbActions = require '../../../actionCreators'
InstalledComponentsActions = require '../../../../components/InstalledComponentsActionCreators'
V2Actions = require('../../../v2-actions').default
{Loader} = require '@keboola/indigo-ui'
credentialsTemplate = require('../../../templates/credentialsFields').default
provisioningTemplates = require('../../../templates/provisioning').default
WrDbStore = require '../../../store'
RoutesStore = require '../../../../../stores/RoutesStore'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
MissingRedshiftModal = require('./MissingRedshiftModal').default
CredentialsForm = require './CredentialsForm'
{isProvisioningCredentials} = require '../../../provisioningUtils'
{div} = React.DOM
{Protected} = require '@keboola/indigo-ui'



{a, h2, h4, form, div, label, p, option, span} = React.DOM

#driver = 'mysql'
#componentId = 'wr-db'
#isProvisioning = true

module.exports = (componentId, driver, isProvisioning) ->
  React.createClass templateFn(componentId, driver, isProvisioning)

templateFn = (componentId, driver, isProvisioning) ->

  displayName: 'WrDbCredentials'

  mixins: [createStoreMixin(InstalledComponentsStore, WrDbStore)]

  getStateFromStores: ->

    configId = RoutesStore.getCurrentRouteParam('config')
    credentials = WrDbStore.getCredentials(componentId, configId)
    isEditing = !! WrDbStore.getEditingByPath(componentId, configId, 'creds')
    editingCredentials = null
    if isEditing
      editingCredentials = WrDbStore.getEditingByPath(componentId, configId, 'creds')
    isSaving = !! WrDbStore.getSavingCredentials(componentId, configId)

    provisioningCredentials = WrDbStore.getProvisioningCredentials(componentId, configId)
    isLoadingProvCredentials = WrDbStore.isLoadingProvCredentials(componentId, configId)
    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    v2Actions = V2Actions(configId, componentId)

    localState: localState
    provisioningCredentials: provisioningCredentials
    credentials: credentials
    configId: configId
    editingCredentials: editingCredentials
    isEditing: isEditing
    isSaving: isSaving
    loadingProvisioning: isLoadingProvCredentials
    v2Actions: v2Actions

  componentDidMount: ->
    state = @state.localState.get 'credentialsState'
    # ignore setting state in some cases
    if state in [
      States.SAVING_NEW_CREDS
      States.PREPARING_PROV_WRITE
      States.CREATE_NEW_CREDS]
      return
    if isProvisioning == false
      @_updateLocalState('credentialsState', States.SHOW_STORED_CREDS)
      return
    if @_hasDbConnection(@state.credentials)
      @_updateLocalState('credentialsState', States.SHOW_STORED_CREDS)
    else
      @_updateLocalState('credentialsState', States.INIT)

  # _runLoadProvReadCredentials: ->
  #   isReadOnly = true
  #   @_updateLocalState('credentialsState', States.LOADING_PROV_READ)
  #   WrDbActions.loadProvisioningCredentials(componentId, @state.configId, isReadOnly, driver).then =>
  #     @_updateLocalState('credentialsState', States.SHOW_PROV_READ_CREDS)

  render: ->
    if isProvisioning
      @renderWithProvisioning()
    else
      @renderNoProvisioning()

  renderMissingRedshiftModal: ->
    React.createElement MissingRedshiftModal,
      show: @state.localState.get('showMissingRedshift', false)
      onHideFn: =>
        @_updateLocalState('showMissingRedshift', false)

  renderNoProvisioning: ->
    credentials = @state.credentials
    state = @state.localState.get 'credentialsState'
    isEditing = false
    if state in [States.SAVING_NEW_CREDS, States.CREATE_NEW_CREDS, States.INIT]
      isEditing = true
      credentials = @state.editingCredentials
    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        @renderMissingRedshiftModal()
        @_renderCredentialsForm(credentials, isEditing)

  renderWithProvisioning: ->
    credentials = @state.credentials
    state = @state.localState.get 'credentialsState'
    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        @renderMissingRedshiftModal()
        switch state
          when States.INIT
            @_renderInit()
          # when States.LOADING_PROV_READ
          #   div className: 'well',
          #     'Loading provisioning credentials '
          #     React.createElement Loader
          when States.PREPARING_PROV_WRITE
            div className: 'well',
              'Preparing provisioning credentials '
              React.createElement Loader
          # when States.SHOW_PROV_READ_CREDS
          #   @_renderCredentialsForm(@_prepareProvReadCredentials(), false)
          when States.SHOW_STORED_CREDS
            @_renderCredentialsForm(@state.credentials, false)
          when States.CREATE_NEW_CREDS
            @_renderCredentialsForm(@state.editingCredentials, true)
          when States.SAVING_NEW_CREDS
            @_renderCredentialsForm(@state.editingCredentials, true)



  _renderInit: ->
    driverName = provisioningTemplates[driver].name
    div null,
      div className: 'kbc-header kbc-row',
        div className: 'kbc-title',
          h2 null, 'Choose which database to use'
      div
        className: 'table table-hover'
        style:
          marginTop: '-1px'
      ,
        div className: 'tbody',
          a
            className: 'tr'
            onClick: @_toggleCreateOwnCredentials
          ,
            span className: 'td',
              h4 className: 'list-group-item-heading', "Own #{driverName} database"
              p className: 'list-group-item-text',
                "User has their own #{driverName} database and will provide its credentials"
          a
            className: 'tr'
            onClick: @_toggleCreateProvWriteCredentials
          ,
            span className: 'td',
              h4 className: 'list-group-item-heading', "Keboola #{driverName} database"
              p className: 'list-group-item-text', "Keboola will provide and setup \
              dedicated #{driverName} database. \
              Any #{driverName} database previously provided for this configuration will be dropped."

  _toggleCreateOwnCredentials: ->
    credentials = @state.credentials.map (value, key) ->
      if key in ['database', 'db', 'host', 'hostname', 'password', 'schema', 'user']
        return ''
      else return value
    defaultPort = @_getDefaultPort()
    credentials = credentials.set 'port', defaultPort
    credentials = credentials.set 'driver', driver
    credentials = credentials.delete 'password'
    WrDbActions.setEditingData componentId, @state.configId, 'creds', credentials
    @_updateLocalState('credentialsState', States.CREATE_NEW_CREDS)


  _toggleCreateProvWriteCredentials: ->
    hasRedshift = ApplicationStore.getSapiToken().getIn ['owner', 'hasRedshift']
    if not hasRedshift and driver == 'redshift'
      return  @_updateLocalState('showMissingRedshift', true)
    @_updateLocalState('credentialsState', States.PREPARING_PROV_WRITE)
    isReadOnly = false
    WrDbActions.loadProvisioningCredentials(componentId, @state.configId, isReadOnly, driver).then =>
      @_updateLocalState('credentialsState', States.SHOW_STORED_CREDS)

  _getDefaultPort: ->
    fields = credentialsTemplate(componentId)
    for field in fields
      if field[1] == 'port'
        return field[4]
    return ''

  _prepareProvReadCredentials: ->
    creds = @state.provisioningCredentials?.get('read')
    if not creds
      return null
    mappings = provisioningTemplates[driver].fieldsMapping
    result = {}
    for key in _.keys(mappings)
      result[key] =  creds.get mappings[key]
    result['port'] = provisioningTemplates[driver].defaultPort
    result['driver'] = driver
    return fromJS result

  _renderCredentialsForm: (credentials, isEditing) ->
    state = @state.localState.get('credentialsState')
    isSaving =  state == States.SAVING_NEW_CREDS
    isProvisioningProp = @_isProvCredentials()
    React.createElement CredentialsForm,
      savedCredentials: @state.credentials
      isEditing: isEditing
      credentials: credentials
      onChangeFn: @_handleChange
      changeCredentialsFn: @setCredentials
      isSaving: isSaving
      isProvisioning: !isEditing && isProvisioningProp
      componentId: componentId
      configId: @state.configId
      driver: driver
      testCredentialsFn: (credentials) =>
        @state.v2Actions.testCredentials(credentials)

  _isProvCredentials: ->
    return isProvisioningCredentials(driver, @state.credentials)

  _handleChange: (propName, event) ->
    if ['port', 'retries'].indexOf(propName) >= 0
      value = parseInt event.target.value
    else
      value = event.target.value
    value = value.toString()
    creds = @state.editingCredentials.set propName, value
    @setCredentials(creds)

  setCredentials: (creds) ->
    WrDbActions.setEditingData componentId, @state.configId, 'creds', creds

  _hasDbConnection: (credentials) ->
    credentials = credentials?.toJS()
    not( _.isEmpty(credentials?.host) or
    _.isEmpty(credentials?.database) or
    #_.isEmpty(credentials?.password) or
    _.isEmpty(credentials?.user) or
    credentials?.port == "NaN")

  _updateLocalState: (path, data) ->
    if _.isString path
      path = [path]
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState, path)
