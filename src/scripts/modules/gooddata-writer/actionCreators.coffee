Promise = require 'bluebird'
_ = require 'underscore'
React = require 'react'
dispatcher = require '../../Dispatcher'
constants = require './constants'
goodDataWriterStore = require './store'
goodDataWriterApi = require './api'
goodDataWriterConstants = require './constants'
jobPoller = require '../../utils/jobPoller'
installedComponentsApi = require '../components/InstalledComponentsApi'
applicationStore = require('../../stores/ApplicationStore').default
applicationActionCreators = require('../../actions/ApplicationActionCreators').default
Link = require('react-router').Link

dimensionsStore = require './dateDimensionsStore'

module.exports =
  deleteTable: (configurationId, tableId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_START
      configurationId: configurationId
      tableId: tableId
    goodDataWriterApi.deleteWriterTable(configurationId, tableId).then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_SUCCESS
        configurationId: configurationId
        tableId: tableId
    .catch (error) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_ERROR
        configurationId: configurationId
        tableId: tableId
      throw error

  addNewTable: (configurationId, tableId, data) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_START
      configurationId: configurationId
      tableId: tableId
      data: data
    goodDataWriterApi.addWriterTable(configurationId, tableId, data).then =>
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_SUCCESS
        configurationId: configurationId
        tableId: tableId
        data: data
      Promise.props
        tableDetail: @loadTableDetail(configurationId, tableId)
        refTables: @loadReferencableTables(configurationId)
      .catch (error) ->
        dispatcher.handleViewAction
          type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_ERROR
          configurationId: configurationId
          tableId: tableId
          data: data
        throw error


  loadConfigurationForce: (configurationId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_START
      configurationId: configurationId

    Promise.props
      id: configurationId
      writer: goodDataWriterApi.getWriter(configurationId)
      tables: goodDataWriterApi.getWriterTables(configurationId)
    .then (configuration) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_SUCCESS
        configuration: configuration

    .catch (error) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_ERROR
        configurationId: configurationId
      throw error

  loadConfiguration: (configurationId) ->
    return Promise.resolve() if goodDataWriterStore.hasWriter(configurationId)
    @loadConfigurationForce(configurationId)

  loadTableDetailForce: (configurationId, tableId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_START
      configurationId: configurationId

    goodDataWriterApi.getTableDetail(configurationId, tableId)
    .then (table) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_SUCCESS
        configurationId: configurationId
        table: table
    .catch (error) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_ERROR
        configurationId: configurationId
        tableId: tableId
      throw error

  loadTableDetail: (configurationId, tableId) ->
    return Promise.resolve() if goodDataWriterStore.hasTableColumns(configurationId, tableId)
    @loadTableDetailForce(configurationId, tableId)

  toggleBucket: (configurationId, bucketId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_SET_BUCKET_TOGGLE
      configurationId: configurationId
      bucketId: bucketId

  loadReferencableTablesForce: (configurationId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_START
      configurationId: configurationId

    goodDataWriterApi.getReferenceableTables(configurationId)
    .then (tables) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_SUCCESS
        configurationId: configurationId
        tables: tables
    .catch (error) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_ERROR
        configurationId: configurationId
        error: error
      throw error

  loadReferencableTables: (configurationId) ->
    if goodDataWriterStore.hasReferenceableTables(configurationId)
      return Promise.resolve()
    else
      return @loadReferencableTablesForce(configurationId)

  optimizeSLIHash: (configurationId, pid) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_START
      configurationId: configurationId

    goodDataWriterApi
    .optimizeSLIHash(configurationId, pid)
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_SUCCESS
        configurationId: configurationId
      applicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "Optimalization of SLI hashes has been triggered! You can track the job progress "
              React.createElement Link,
                to: 'jobDetail'
                params:
                  jobId: job.id
                onClick: @props.onClick
              ,
                'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_ERROR
        configurationId: configurationId
        error: e
      throw e

  resetProject: (configurationId, pid) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_START
      configurationId: configurationId

    goodDataWriterApi
    .resetProject configurationId, pid
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_SUCCESS
        configurationId: configurationId
      applicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "Project has been scheduled to reset! You can track the job progress "
              React.createElement Link,
                to: 'jobDetail'
                params:
                  jobId: job.id
                onClick: @props.onClick
              ,
                'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_ERROR
        configurationId: configurationId
        error: e
      throw e

  saveMultipleTableFields: (configurationId, tableId, fields) ->
    _.map(fields, (newValue, fieldName)  ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_START
        configurationId: configurationId
        tableId: tableId
        field: fieldName
        value: newValue
    )
    goodDataWriterApi
    .updateTable(configurationId, tableId, fields)
    .then ->
      _.map(fields, (newValue, fieldName)  ->
        dispatcher.handleViewAction
          type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_SUCCESS
          configurationId: configurationId
          tableId: tableId
          field: fieldName
          value: newValue
      )
    .catch (e) ->
      _.map(fields, (newValue, fieldName)  ->
        dispatcher.handleViewAction
          type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_ERROR
          configurationId: configurationId
          tableId: tableId
          field: fieldName
          value: newValue
          error: e
      )
      throw e



  saveTableField: (configurationId, tableId, fieldName, newValue) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_START
      configurationId: configurationId
      tableId: tableId
      field: fieldName
      value: newValue

    #isNewWriter bc migration
    saveFieldName = fieldName

    data = {}
    data[saveFieldName] = newValue
    goodDataWriterApi
    .updateTable(configurationId, tableId, data)
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_SUCCESS
        configurationId: configurationId
        tableId: tableId
        field: fieldName
        value: newValue
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_ERROR
        configurationId: configurationId
        tableId: tableId
        field: fieldName
        value: newValue
        error: e
      throw e

  startTableFieldEdit: (configurationId, tableId, field) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_START
      tableId: tableId
      configurationId: configurationId
      field: field

  updateTableFieldEdit: (configurationId, tableId, field, newValue) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_UPDATE
      configurationId: configurationId
      tableId: tableId
      field: field
      value: newValue

  cancelTableFieldEdit: (configurationId, tableId, field) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_CANCEL
      tableId: tableId
      configurationId: configurationId
      field: field


  startTableColumnsEdit: (configurationId, tableId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_START
      configurationId: configurationId
      tableId: tableId

  cancelTableColumnsEdit: (configurationId, tableId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_CANCEL
      configurationId: configurationId
      tableId: tableId

  updateTableColumnsEdit: (configurationId, tableId, column) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_UPDATE
      configurationId: configurationId
      tableId: tableId
      column: column

  saveTableColumnsEdit: (configurationId, tableId) ->
    columns = goodDataWriterStore.getTableColumns(configurationId, tableId, 'editing')

    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_START
      configurationId: configurationId
      tableId: tableId

    #isNewWriter bc migration
    columns = columns.map((column) -> column.remove('gdName'))

    goodDataWriterApi
    .updateTable(configurationId, tableId,
      columns: columns
    )
    .then =>
      @loadReferencableTablesForce(configurationId)
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_SUCCESS
        configurationId: configurationId
        tableId: tableId
        columns: columns.toJS()

    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_ERROR
        configurationId: configurationId
        tableId: tableId
        error: e
      throw e

  uploadDateDimensionToGoodData: (configurationId, dimensionName, pid) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_START
      configurationId: configurationId
      dimensionName: dimensionName

    goodDataWriterApi
    .uploadDateDimension(configurationId, dimensionName, pid)
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_SUCCESS
        configurationId: configurationId
        dimensionName: dimensionName
        job: job

      applicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "GoodData upload of dimension "
              React.DOM.strong null, dimensionName
              " has been initiated You can track the job progress "
              React.createElement Link,
                to: 'jobDetail'
                params:
                  jobId: job.id
                onClick: @props.onClick
              ,
                'here'

    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_ERROR
        configurationId: configurationId
        dimensionName: dimensionName
        error: e
      throw e



  uploadToGoodData: (configurationId, tableId = null) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_START
      configurationId: configurationId
      tableId: tableId

    if tableId
      promise = goodDataWriterApi.uploadTable configurationId, tableId
    else
      promise = goodDataWriterApi.uploadProject configurationId

    promise
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_SUCCESS
        configurationId: configurationId
        tableId: tableId
        job: job

      if tableId
        table = goodDataWriterStore.getTable configurationId, tableId
        applicationActionCreators.sendNotification
          message: React.createClass
            render: ->
              React.DOM.span null,
                "GoodData upload of table "
                React.DOM.strong null, table.getIn ['data', 'title']
                " has been initiated You can track the job progress "
                React.createElement Link,
                  to: 'jobDetail'
                  params:
                    jobId: job.id
                  onClick: @props.onClick
                ,
                  'here'
      else
        applicationActionCreators.sendNotification
          message: React.createClass
            render: ->
              React.DOM.span null,
                "GoodData upload has been initiated. You can track the job progress "
                React.createElement Link,
                  to: 'jobDetail'
                  params:
                    jobId: job.id
                  onClick: @props.onClick
                ,
                  'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_ERROR
        configurationId: configurationId
        tableId: tableId
        error: e
      throw e

  resetTable: (configurationId, tableId, pid) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_START
      configurationId: configurationId
      tableId: tableId

    goodDataWriterApi
    .resetTable configurationId, tableId, pid
    .then (job) ->
      jobPoller.poll applicationStore.getSapiTokenString(), job.url
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_SUCCESS
        configurationId: configurationId
        tableId: tableId

      applicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "Table reset has been initiated. You can track the job progress "
              React.createElement Link,
                to: 'jobDetail'
                params:
                  jobId: job.id
                onClick: @props.onClick
              ,
                'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_ERROR
        configurationId: configurationId
        tableId: tableId
        error: e
      throw e

  synchronizeTable: (configurationId, tableId, pid) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_START
      configurationId: configurationId
      tableId: tableId

    goodDataWriterApi
    .synchronizeTable configurationId, tableId, pid
    .then (job) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_SUCCESS
        configurationId: configurationId
        tableId: tableId

      applicationActionCreators.sendNotification
        message: React.createClass
          render: ->
            React.DOM.span null,
              "Dataset synchronize has been initiated. You can track the job progress "
              React.createElement Link,
                to: 'jobDetail'
                params:
                  jobId: job.id
                onClick: @props.onClick
              ,
                'here'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_ERROR
        configurationId: configurationId
        tableId: tableId
        error: e
      throw e

  loadDateDimensions: (configurationId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_START
      configurationId: configurationId

    goodDataWriterApi
    .getDateDimensions(configurationId)
    .then (dimensions) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_SUCCESS
        configurationId: configurationId
        dimensions: dimensions
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_ERROR
        configurationId: configurationId
        error: e
      throw e

  deleteDateDimension: (configurationId, dateDimensionName) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_START
      configurationId: configurationId
      dimensionName: dateDimensionName

    goodDataWriterApi
    .deleteDateDimension(configurationId, dateDimensionName)
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_SUCCESS
        configurationId: configurationId
        dimensionName: dateDimensionName
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_ERROR
        configurationId: configurationId
        dimensionName: dateDimensionName
        error: e
      throw e


  updateNewDateDimension: (configurationId, newDimension) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_UPDATE
      configurationId: configurationId
      dimension: newDimension

  saveNewDateDimension: (configurationId) ->
    dateDimension = dimensionsStore.getNewDimension(configurationId)

    if dateDimension.get('template') == constants.DateDimensionTemplates.CUSTOM
      dateDimension = dateDimension
        .set('template', dateDimension.get('customTemplate'))
        .delete('customTemplate')

    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_START
      configurationId: configurationId

    goodDataWriterApi
    .createDateDimension(configurationId, dateDimension.toJS())
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_SUCCESS
        configurationId: configurationId
        dimension: dateDimension
      dateDimension
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_ERROR
        configurationId: configurationId
        error: e
      throw e

  deleteWriter: (configurationId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_START
      configurationId: configurationId

    goodDataWriterApi
    .deleteWriter configurationId
    .then ->
      installedComponentsApi.deleteConfiguration 'gooddata-writer', configurationId
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_SUCCESS
        configurationId: configurationId

      applicationActionCreators.sendNotification
        message: 'Writer has been scheduled for removal!'

    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_ERROR
        configurationId: configurationId
        error: e
      throw e

  setWriterTablesFilter: (configurationId, query) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLES_FILTER_CHANGE
      filter: query
      configurationId: configurationId

  enableProjectAccess: (configurationId, projectId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_LOADING
      configurationId: configurationId
      projectId: projectId
    goodDataWriterApi
    .enableProjectAccess configurationId, projectId
    .then (result) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ENABLE
        configurationId: configurationId
        projectId: projectId
        ssoLink: result.link
        ssoProvider: result.ssoProvider
        encryptedClaims: result.encryptedClaims
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ERROR
        configurationId: configurationId
        projectId: projectId
      throw e


  disableProjectAccess: (configurationId, projectId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_LOADING
      configurationId: configurationId
      projectId: projectId
    goodDataWriterApi
    .disableProjectAccess configurationId, projectId
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_DISABLE
        configurationId: configurationId
        projectId: projectId
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ERROR
        configurationId: configurationId
        projectId: projectId
      throw e
