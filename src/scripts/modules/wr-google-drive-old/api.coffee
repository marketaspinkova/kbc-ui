Immutable = require 'immutable'
SyrupApi = require('../components/SyrupComponentApi').default

createRequest = (method, path) ->
  SyrupApi.createRequest('wr-google-drive', method, path)

module.exports =

  getFiles: (configId) ->
    createRequest('GET', "files/#{configId}")
    .promise()
    .then (response) ->
      response.body

  getAccount: (configId) ->
    createRequest('GET', "accounts/#{configId}")
    .promise()
    .then (response) ->
      response.body

  postFile: (configId, file) ->
    createRequest('POST', "files/#{configId}")
    .send file
    .promise()
    .then (response) ->
      response.body

  putFile: (configId, fileId, file) ->
    createRequest('PUT', "files/#{configId}/#{fileId}")
    .send file
    .promise()
    .then (response) ->
      response.body




  deleteFile: (configId, rowId) ->
    createRequest('DELETE', "files/#{configId}/#{rowId}")
    .promise()
    .then (response) ->
      response.body

  getFileInfo: (configId, googleId) ->
    createRequest('GET', "remote-file/#{configId}/#{googleId}")
    .promise()
    .then (response) ->
      response.body
