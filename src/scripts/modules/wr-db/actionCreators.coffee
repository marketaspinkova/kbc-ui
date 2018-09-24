Promise = require('bluebird')
_ = require 'underscore'
api = require('./api')
store = require('./store')
dispatcher = require('../../Dispatcher')
constants = require './constants'
provisioningUtils = require './provisioningUtils'
{fromJS} = require 'immutable'
provisioningTemplates = require('./templates/provisioning').default


convertFromProvCredentials = (creds, driver) ->
  mappings = provisioningTemplates[driver].fieldsMapping
  result = {}
  for key in _.keys(mappings)
    result[key] =  creds.get mappings[key]
  result['port'] = provisioningTemplates[driver].defaultPort
  result['driver'] = driver
  return result

module.exports =
  resetProvisioning: (componentId, configId, driver) ->
    currentProvisioningCredentials = store.getProvisioningCredentials(componentId, configId)
    provisioningUtils.clearAll(componentId, configId, driver, currentProvisioningCredentials)

  loadProvisioningCredentials: (componentId, configId, isReadOnly, driver) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_START
      componentId: componentId
      configId: configId
    resetPromise = if isReadOnly then Promise.resolve() else @resetProvisioning(componentId, configId, driver)
    resetPromise.then =>
      provisioningUtils.getCredentials(isReadOnly, driver, componentId, configId).then (result) =>
        if isReadOnly
          dispatcher.handleViewAction
            type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_SUCCESS
            componentId: componentId
            configId: configId
            credentials: result
        else
          writeCreds = fromJS(convertFromProvCredentials(result.write, driver))
          @saveCredentials(componentId, configId, writeCreds).then ->
            dispatcher.handleViewAction
              type: constants.ActionTypes.WR_DB_LOAD_PROVISIONING_SUCCESS
              componentId: componentId
              configId: configId
              credentials: result

      .catch (err) ->
        dispatcher.handleViewAction
          type: constants.ActionTypes.WR_DB_API_ERROR
          componentId: componentId
          configId: configId
          error: err
        throw err


  loadTableConfig: (componentId, configId, tableId) ->
    if store.hasTableConfig(componentId, configId, tableId)
      return Promise.resolve()
    else
      @loadTableConfigForce(componentId, configId, tableId)

  loadTableConfigForce: (componentId, configId, tableId) ->
    api(componentId).getTable(configId, tableId)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_GET_TABLE_SUCCESS
        componentId: componentId
        configId: configId
        tableId: tableId
        tableConfig: result
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err


  resetCredentials: (componentId, configId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_SUCCESS
      componentId: componentId
      configId: configId
      credentials: null

  setEditingData: (componentId, configId, path, data) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SET_EDITING
      componentId: componentId
      configId: configId
      path: path
      data: data

  addTableToConfig: (componentId, configId, tableId, sapiTable) ->
    table =
      id: tableId
      dbName: sapiTable.get('name')
      name: sapiTable.get('name')
      export: true
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_ADD_TABLE_START
      componentId: componentId
      configId: configId
      tableId: tableId
      table: table
    api(componentId).postTable(configId, tableId, table, sapiTable.get('columns'))
    .then (result) =>
      @loadTableConfig(componentId, configId, tableId).then ->
        dispatcher.handleViewAction
          type: constants.ActionTypes.WR_DB_ADD_TABLE_SUCCESS
          componentId: componentId
          configId: configId
          tableId: tableId
          table: table
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err

  saveCredentials: (componentId, configId, credentials) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_START
      componentId: componentId
      configId: configId
      credentials: credentials
    api(componentId).postCredentials(configId, credentials.toJS())
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_SAVE_CREDENTIALS_SUCCESS
        componentId: componentId
        configId: configId
        credentials: credentials

    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        errorPath: ['savingCredentials', componentId, configId]
        error: err
      throw err

  loadConfiguration: (componentId, configId) ->
    if store.hasConfiguration(componentId, configId)
      return Promise.resolve()
    else
      @loadConfigurationForce(componentId, configId)


  loadConfigurationForce: (componentId, configId) ->
    Promise.props
      componentId: componentId
      configId: configId
      credentials: api(componentId).getCredentials(configId)
      tables: api(componentId).getTables(configId)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_GET_CONFIGURATION_SUCCESS
        componentId: componentId
        configId: configId
        config: result #credentials&tables
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err
  deleteTable: (componentId, configId, tableId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_DELETE_TABLE_START
      componentId: componentId
      configId: configId
      tableId: tableId

    api(componentId).deleteTable(configId, tableId)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_DELETE_TABLE_SUCCESS
        componentId: componentId
        configId: configId
        tableId: tableId
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err



  saveTableColumns: (componentId, configId, tableId, columns) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SAVE_COLUMNS_START
      componentId: componentId
      configId: configId
      tableId: tableId
      columns: columns

    api(componentId).setTableColumns(configId, tableId, columns.toJS())
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_SAVE_COLUMNS_SUCCESS
        componentId: componentId
        configId: configId
        tableId: tableId
        columns: columns

    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err


  setTableToExport: (componentId, configId, tableId, dbName, isExported) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SET_TABLE_START
      componentId: componentId
      configId: configId
      tableId: tableId
      dbName: dbName
      isExported: isExported
    api(componentId).setTable(configId, tableId, dbName, isExported)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_SET_TABLE_SUCCESS
        componentId: componentId
        configId: configId
        tableId: tableId
        dbName: dbName
        isExported: isExported
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        componentId: componentId
        configId: configId
        error: err
      throw err
