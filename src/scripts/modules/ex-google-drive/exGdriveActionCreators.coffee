dispatcher = require '../../Dispatcher.coffee'
constants = require './exGdriveConstants.coffee'
Promise = require('bluebird')
exGdriveApi = require './exGdriveApi.coffee'
exGdriveStore = require './exGdriveStore.coffee'
module.exports =

  loadConfigurationForce: (configurationId) ->
    Promise.props
      id: configurationId
      configuration: exGdriveApi.getConfiguration(configurationId)
    .then (configuration) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.EX_GDRIVE_CONFIGURATION_LOAD_SUCCESS
        configuration: configuration

  loadConfiguration: (configurationId) ->
    return Promise.resolve() if exGdriveStore.hasConfig configurationId
    @loadConfigurationForce(configurationId)

  editSheetStart: (configId, sheetId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.EX_GDRIVE_SHEET_EDIT_START
      configurationId: configId
      sheetId: sheetId

  cancelSheetEdit: (configId, sheetId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.EX_GDRIVE_SHEET_EDIT_CANCEL
      configurationId: configId
      sheetId: sheetId

  sheetEditOnChange: (configId, sheetId, propName, newValue) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.EX_GDRIVE_SHEET_ON_CHANGE
      configurationId: configId
      sheetId: sheetId
      propName: propName
      newValue: newValue



  saveSheetEdit: (configId, sheetId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.EX_GDRIVE_SHEET_EDIT_SAVE_START
      configurationId: configId
      sheetId: sheetId
    sheet = exGdriveStore.getSavingSheet configId, sheetId
    exGdriveApi.storeNewSheets(configId, [sheet.toJS()])
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.EX_GDRIVE_SHEET_EDIT_SAVE_END
        configurationId: configId
        sheetId: sheetId
        result: result
