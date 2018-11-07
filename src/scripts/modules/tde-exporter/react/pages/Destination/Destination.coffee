React = require 'react'
Link = require('react-router').Link

ComponentsStore  = require('../../../../components/stores/ComponentsStore').default
createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
ComponentName = React.createFactory(require('../../../../../react/common/ComponentName').default)
ComponentIcon = React.createFactory(require('../../../../../react/common/ComponentIcon').default)
ComponentEmptyState = require('../../../../components/react/components/ComponentEmptyState').default

uploadUtils = require '../../../uploadUtils'

SelectWriterModal = require('./WritersModal').default

ActivateDeactivateButton = React.createFactory(require('../../../../../react/common/ActivateDeactivateButton').default)

InstalledComponentsStore = require('../../../../components/stores/InstalledComponentsStore').default
OAuthStore = require('../../../../oauth-v2/Store').default

InstalledComponentsActions = require '../../../../components/InstalledComponentsActionCreators'
ApplicationActionCreators = require('../../../../../actions/ApplicationActionCreators').default
{OAUTH_V2_WRITERS} = require '../../../tdeCommon'

RoutesStore = require '../../../../../stores/RoutesStore'
{List, Map, fromJS} = require 'immutable'

GdriveRow = React.createFactory require './GdriveRow'
TableauServerRow = React.createFactory require './TableauServerRow'
OauthV2WriterRow = React.createFactory(require('./OauthV2WriterRow').default)

{button, strong, div, h2, span, h4, section, p, i} = React.DOM

componentId = 'tde-exporter'

module.exports = React.createClass
  displayName: 'TDEDestination'

  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore)]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')

    configData = InstalledComponentsStore.getConfigData(componentId, configId)
    localState = InstalledComponentsStore.getLocalState(componentId, configId)

    #state
    configId: configId
    configData: configData
    localState: localState
    isSaving: InstalledComponentsStore.isSavingConfigData(componentId, configId)
    savingData: InstalledComponentsStore.getSavingConfigData(componentId, configId)

  render: ->
    parameters = @state.configData.get('parameters') or Map()
    destinationRow =
      React.createElement ComponentEmptyState, null,
        p null, 'Upload destination is not chosen'
        button
          type: 'button'
          className: 'btn btn-success'
          onClick: @_showWritersModal
          'Choose Destination'

    task = @state.configData.getIn ['parameters', 'stageUploadTask']
    switch task
      when "tableauServer" then destinationRow = @_renderTableauServer()
      when "gdrive" then destinationRow = @_renderGoogleDrive()
    if task in OAUTH_V2_WRITERS
      destinationRow = @_renderOAuthV2Writer(task)

    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        React.createElement SelectWriterModal,
          isSaving: @state.isSaving
          localState: @state.localState.get('writersModal', Map())
          setLocalState: (key, value ) =>
            @_updateLocalState(['writersModal'].concat(key), value)
          onChangeWriterFn: (newTask) =>
            params = @state.configData.get('parameters') or Map()
            params = params.set('stageUploadTask', newTask)
            params = params.set('uploadTasks', List())
            @_saveConfigData(['parameters'], params).then( =>
              @_updateLocalState(['writersModal', 'show'], false)
            )
        destinationRow

  _renderOAuthV2Writer: (componentId) ->
    parameters = @state.configData.get 'parameters'
    componentData = parameters.get(componentId, Map())
    credentialsId = componentData.get('id')
    oauthCredentials = credentialsId && OAuthStore.getCredentials(componentId, credentialsId)
    isAuthorized = uploadUtils.isOauthV2Authorized(parameters, componentId) && oauthCredentials
    OauthV2WriterRow
      componentData: componentData
      configId: @state.configId
      localState: @state.localState
      updateLocalState: @_updateLocalState
      componentId: componentId
      isAuthorized: isAuthorized
      oauthCredentials: oauthCredentials
      setConfigDataFn: @_saveConfigData
      renderComponent: =>
        @_renderComponentCol(componentId)
      renderEnableUpload: (name) =>
        @_renderEnableUploadCol(componentId, isAuthorized, name)
      resetUploadTask: =>
        @_resetUploadTask(componentId)

  _renderGoogleDrive: ->
    parameters = @state.configData.get 'parameters'
    account = @state.configData.getIn ['parameters', 'gdrive']
    description = account?.get 'email'
    isAuthorized = uploadUtils.isGdriveAuthorized(parameters)
    GdriveRow
      configId: @state.configId
      localState: @state.localState
      updateLocalStateFn: @_updateLocalState
      account: @state.configData.getIn ['parameters', 'gdrive']
      setConfigDataFn: @_saveConfigData
      saveTargetFolderFn: (folderId, folderName) =>
        path = ['parameters', 'gdrive']
        gdrive = @state.configData.getIn path, Map()
        gdrive = gdrive.set('targetFolder', folderId)
        gdrive = gdrive.set('targetFolderName', folderName)
        @_saveConfigData(path, gdrive)
      renderComponent: =>
        @_renderComponentCol('wr-google-drive')
      renderEnableUpload: (name) =>
        @_renderEnableUploadCol('gdrive', isAuthorized, name)
      resetUploadTask: =>
        @_resetUploadTask('gdrive')

  _renderTableauServer: ->
    parameters = @state.configData.get 'parameters'
    account = @state.configData.getIn ['parameters', 'tableauServer']
    description = account?.get 'server_url'
    isAuthorized = uploadUtils.isTableauServerAuthorized(parameters)
    TableauServerRow
      configId: @state.configId
      localState: @state.localState
      updateLocalStateFn: @_updateLocalState
      account: account
      setConfigDataFn: @_saveConfigData
      renderComponent: =>
        @_renderComponentCol('wr-tableau-server')
      renderEnableUpload: (name) =>
        @_renderEnableUploadCol('tableauServer', isAuthorized, name)
      resetUploadTask: =>
        @_resetUploadTask('tableauServer')


  _saveConfigData: (path, data) ->
    newData = @state.configData.setIn path, data
    saveFn = InstalledComponentsActions.saveComponentConfigData
    saveFn(componentId, @state.configId, fromJS(newData))


  _updateLocalState: (path, data) ->
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState, path)

  _renderComponentCol: (pcomponentId) ->
    component = ComponentsStore.getComponent(pcomponentId)
    return span {className: ''},
      ComponentIcon {component: component, size: '32'}
      ' '
      span style: {paddingRight: '1em'},
        ComponentName component: component
      ' '
      button
        type: 'button'
        className: 'btn btn-success'
        onClick: @_showWritersModal,
          i className: 'fa fa-cog'
          ' Change'

  _showWritersModal: ->
    @_updateLocalState(['writersModal', 'show'], true)

  _hasUploadTask: (taskName) ->
    tasks = @state.configData.getIn(['parameters', 'uploadTasks'], List())
    return tasks.find( (t) -> t == taskName)?

  _toggleImmediateUpload: (taskName, isActive) ->
    tasks = @state.configData.getIn(['parameters', 'uploadTasks'], List())
    newTasks = List([taskName])
    if isActive
      newTasks = List()
    @_saveConfigData(['parameters', 'uploadTasks'], newTasks)

  _renderEnableUploadCol: (componentKey, isAuthorized, accountName) ->
    if not isAuthorized
      return div(null)

    isActive = @_hasUploadTask(componentKey) # gdrive, dropbox, # tableauServer
    isSaving = false
    if @state.isSaving
      savingTasks = @state.savingData.getIn(['parameters', 'uploadTasks'], List())
      hasTask = savingTasks.find((t) -> t == componentKey)
      if isActive
        isSaving = !hasTask
      else
        isSaving = !!hasTask

    helpText = "All TDE files will be uploaded to #{accountName} immediately after export."
    if not isActive
      helpText = 'No instant upload of TDE files after export.'
    span null,
      span className: 'help-block', helpText
      ActivateDeactivateButton
        mode: 'link'
        key: 'active'
        activateTooltip: 'Enable instant upload'
        deactivateTooltip: 'Disable instant upload'
        isActive: isActive
        isPending: isSaving
        onChange: =>
          @_toggleImmediateUpload(componentKey, isActive)


  _resetUploadTask: (taskName) ->
    params = @state.configData.getIn(['parameters'], Map())
    params = params.delete(taskName)
    params = params.set('uploadTasks', List())
    params = params.delete('stageUploadTask')
    @_saveConfigData(['parameters'], params)
