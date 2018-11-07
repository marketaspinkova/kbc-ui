Immutable = require 'immutable'
SyrupApi = require('../components/SyrupComponentApi').default
ApplicationStore = require '../../stores/ApplicationStore'

createRequest = (method, path) ->
  SyrupApi.createRequest('gooddata-writer', method, path)

module.exports =

  # getWriters: ->  NOT USED
  #   createRequest('GET', "v2")
  #   .promise()
  #   .then((response) ->
  #     response.body
  #   )

  getWriter: (configurationId) ->
    createRequest('GET', "v2/" + configurationId + "?include=project,project.ssoLink")
    .promise()
    .then((response) ->
      response.body
    )

  getWriterModel: (configurationId) ->
    createRequest('GET', "v2/#{configurationId}/model")
    # .query config: configurationId
    .promise()
    .then (response) ->
      response.body

  getWriterTables: (configurationId) ->
    createRequest('GET', "v2/" + configurationId + "/tables")
    #.query config: configurationId
    .promise()
    .then((response) ->
      response.body
    )

  deleteWriterTable: (configurationId, tableId) ->
    createRequest('DELETE', "v2/" + configurationId + "/tables/" + tableId)
    .promise()
    .then (response) ->
      response.body

  addWriterTable: (configurationId, tableId, data) ->
    createRequest('POST', "v2/" + configurationId + "/tables/" + tableId)
    .send data.toJS()
    .promise()
    .then (response) ->
      response.body

  getTableDetail: (configurationId, tableId) ->
    createRequest('GET', "v2/" + configurationId + "/tables/" + tableId)
    .query include: 'columns'
    .promise()
    .then (response) ->
      response.body

  getReferenceableTables: (configurationId) ->
    createRequest('GET', "v2/" + configurationId + "/referenceable-tables")
    .promise()
    .then (response) ->
      response.body

  updateTable: (configurationId, tableId, data) ->
    # data = Immutable.fromJS(data)
    #   .set 'config', configurationId
    #   .set 'tableId', tableId

    createRequest('PATCH', "v2/" + configurationId + "/tables/" + tableId)
    .send data
    .promise()
    .then (response) ->
      response.body

  resetTable: (configurationId, tableId, pid) ->
    createRequest('DELETE', "v2/#{configurationId}/projects/#{pid}/datasets/#{tableId}")
    .promise()
    .then (response) ->
      response.body

  synchronizeTable: (configurationId, tableId, pid) ->
    createRequest('POST', "v2/#{configurationId}/tables/#{tableId}/synchronize/#{pid}")
    # .send
    #   tables: [tableId]
    #   config: configurationId
    .promise()
    .then (response) ->
      response.body

  uploadTable: (configurationId, tableId) ->
    createRequest('POST', 'upload-table')
    .send
      tableId: tableId
      config: configurationId
    .promise()
    .then (response) ->
      response.body

  uploadDateDimension: (configurationId, dimensionName, pid) ->
    createRequest('POST', "v2/#{configurationId}/date-dimensions/#{dimensionName}/upload/#{pid}")
    # .send
    #   name: dimensionName
    #   config: configurationId
    .promise()
    .then (response) ->
      response.body

  uploadProject: (configurationId) ->
    createRequest('POST', 'upload-project')
    .send
      config: configurationId
    .promise()
    .then (response) ->
      response.body

  optimizeSLIHash: (configurationId, pid) ->
    createRequest('POST', "v2/#{configurationId}/projects/#{pid}/optimize-sli-hash")
    .promise()
    .then (response) ->
      response.body

  resetProject: (configurationId, pid) ->
    createRequest('DELETE', "v2/#{configurationId}/projects/#{pid}")
    .promise()
    .then (response) ->
      response.body

  deleteWriter: (configurationId) ->
    createRequest('DELETE', "v2/#{configurationId}")
    .promise()
    .then (response) ->
      response.body

  getDateDimensions: (configurationId) ->
    createRequest('GET', "v2/#{configurationId}/date-dimensions")
    .promise()
    .then (response) ->
      response.body

  deleteDateDimension: (configurationId, name) ->
    createRequest('DELETE', "v2/#{configurationId}/date-dimensions/#{name}")
    .promise()
    .then (response) ->
      response.body

  createDateDimension: (configurationId, dateDimension) ->
    data = Immutable.fromJS(dateDimension)

    createRequest('POST', "v2/#{configurationId}/date-dimensions")
    .send data.toJS()
    .promise()
    .then (response) ->
      response.body


  enableProjectAccess: (configurationId, pid) ->
    createRequest('POST', "v2/" + configurationId + "/projects/" + pid + "/access")
    .promise()
    .then((response) ->
      response.body
    )

  disableProjectAccess: (configurationId, pid) ->
    createRequest('DELETE', "v2/" + configurationId + "/projects/" + pid + "/access")
    .promise()
    .then((response) ->
      response.body
    )
