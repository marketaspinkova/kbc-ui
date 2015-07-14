Promise = require('bluebird')
api = require('./api')
store = require('./store')
dispatcher = require('../../Dispatcher')
constants = require './constants'
module.exports =
  loadTableColumns: (driver, configId, tableId) ->
    if store.hasColumns(driver, configId, tableId)
      return Promise.resolve()
    else
      @loadTableColumnsForce(driver, configId, tableId)

  loadTableColumnsForce: (driver, configId, tableId) ->
    api.getColumns(driver, configId, tableId)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_GET_COLUMNS_SUCCESS
        driver: driver
        configId: configId
        tableId: tableId
        columns: result
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        driver: driver
        configId: configId
        error: err
      throw err



  loadConfiguration: (driver, configId) ->
    if store.hasConfiguration(driver, configId)
      return Promise.resolve()
    else
      @loadConfigurationForce(driver, configId)


  loadConfigurationForce: (driver, configId) ->
    Promise.props
      driver: driver
      configId: configId
      credentials: api.getCredentials(driver, configId)
      tables: api.getTables(driver, configId)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_GET_CONFIGURATION_SUCCESS
        driver: driver
        configId: configId
        config: result #credentials&tables
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        driver: driver
        configId: configId
        error: err
      throw err

  setTableToExport: (driver, configId, tableId, dbName, isExported) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.WR_DB_SET_TABLE_START
      driver: driver
      configId: configId
      tableId: tableId
      dbName: dbName
      isExported: isExported
    api.setTable(driver, configId, tableId, dbName, isExported)
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_SET_TABLE_SUCCESS
        driver: driver
        configId: configId
        tableId: tableId
        dbName: dbName
        isExported: isExported
    .catch (err) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.WR_DB_API_ERROR
        driver: driver
        configId: configId
        error: err
      throw err
