
EventEmitter = require('events').EventEmitter
Dispatcher = require('../dispatcher/KbcDispatcher.coffee')
constants = require '../constants/KbcConstants.coffee'
Immutable = require('immutable')
assign = require 'object-assign'

_installedComponents =  Immutable.fromJS([{"id":"ex-db","type":"extractor","name":"Database Extractor","description":"Fetch data from MySQL or MSSQL","hasUI":true,"hasRun":true,"ico32":"","ico64":"","uri":"https:\/\/syrup.keboola.com\/ex-db","configurations":[{"id":"Academy","name":"Academy","description":"","created":"2014-05-07T09:24:57+0200","creatorToken":{"id":491,"description":"Master Token"}},{"id":"Pohoda","name":"Pohoda","description":"","created":"2014-05-07T09:25:02+0200","creatorToken":{"id":491,"description":"Master Token"}}]},{"id":"ex-gooddata","type":"extractor","name":"Gooddata","description":"Download reports from GoodData","hasUI":true,"hasRun":true,"ico32":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/gooddata32-2.png","ico64":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/gooddata64-2.png","uri":"https:\/\/syrup.keboola.com\/ex-gooddata","configurations":[{"id":"academyrevenue","name":"AcademyRevenue","description":"Pulling Partner Revenue from the Academy Admin GD project","created":"2014-11-15T01:32:40+0100","creatorToken":{"id":3677,"description":"milan@keboola.com"}},{"id":"pebblerevenue","name":"PebbleRevenue","description":"Monitoring of complete revenue for the Pebble app","created":"2014-07-10T23:51:27+0200","creatorToken":{"id":491,"description":"Master Token"}}]},{"id":"ex-google-drive","type":"extractor","name":"Google Drive","description":"Extract spreadsheet data from Google Drive","hasUI":true,"hasRun":true,"ico32":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/Google-Drive-icon-32-1.png","ico64":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/Google-Drive-icon-64-1.png","uri":"https:\/\/syrup.keboola.com\/ex-google-drive","configurations":[{"id":"account0","name":"account-0","description":"","created":"2014-01-27T17:23:55+0100","creatorToken":{"id":491,"description":"Master Token"}}]},{"id":"ex-zendesk","type":"extractor","name":"Zendesk","description":"Software for better customer service","hasUI":true,"hasRun":true,"ico32":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/zendesk-32-1.png","ico64":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/zendesk-64-1.png","uri":"https:\/\/syrup.keboola.com\/ex-zendesk","configurations":[{"id":"tickets","name":"tickets","description":"","created":"2014-08-14T15:02:05+0200","creatorToken":{"id":491,"description":"Master Token"}}]},{"id":"gooddata-writer","type":"writer","name":"GoodData","description":"The Open Analytics Platform","hasUI":true,"hasRun":false,"ico32":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/gooddata32-2.png","ico64":"https:\/\/d3iz2gfan5zufq.cloudfront.net\/images\/cloud-services\/gooddata64-2.png","uri":"https:\/\/syrup.keboola.com\/gooddata-writer","configurations":[{"id":"1091","name":"1091","description":"","created":"2012-10-31T16:27:34+0100","creatorToken":{"id":491,"description":"Master Token"}},{"id":"Academy_Import","name":"Academy_Import","description":"Academy admin project, here for data export purposes, potentially to push usage in.","created":"2014-11-15T01:31:21+0100","creatorToken":{"id":3677,"description":"milan@keboola.com"}},{"id":"KB_PM","name":"KB_PM","description":"","created":"2013-04-28T02:32:53+0200","creatorToken":{"id":491,"description":"Master Token"}}]},{"id":"transformation","type":"transformation","name":"Transformations","description":"Transform data","hasUI":false,"hasRun":false,"ico32":"","ico64":"","uri":"https:\/\/transformation.keboola.com","configurations":[{"id":"sys.c-tr-gdprices","name":"sys.c-tr-gdprices","description":"GD Price list","created":"2014-02-21T01:03:45+0100","creatorToken":{"id":491,"description":"Master Token"}},{"id":"sys.c-tr-gdstats","name":"sys.c-tr-gdstats","description":"GD projects","created":"2014-01-12T05:11:00+0100","creatorToken":{"id":491,"description":"Master Token"}},{"id":"sys.c-tr-pebble","name":"sys.c-tr-pebble","description":"Get pebble data ready!","created":"2014-07-11T01:44:55+0200","creatorToken":{"id":491,"description":"Master Token"}},{"id":"sys.c-tr-redshift","name":"sys.c-tr-redshift","description":"Redshift transformations","created":"2014-02-21T14:16:38+0100","creatorToken":{"id":491,"description":"Master Token"}},{"id":"sys.c-tr-usagestats","name":"sys.c-tr-usagestats","description":"KBC and GD data all together mixed into Paymo","created":"2014-06-14T00:19:51+0200","creatorToken":{"id":491,"description":"Master Token"}},{"id":"sys.c-transformation","name":"sys.c-transformation","description":"Transformations","created":"2012-10-10T15:32:52+0200","creatorToken":{"id":491,"description":"Master Token"}}]}])
_isLoaded = false

CHANGE_EVENT = 'change'

InstalledComponentsStore = assign {}, EventEmitter.prototype,

  getAll: ->
    _installedComponents

  getAllForType: (type) ->
    _installedComponents.filter((component) ->
      component.get('type') == type
    )

  getIsLoaded: ->
    _isLoaded

  addChangeListener: (callback) ->
    @on(CHANGE_EVENT, callback)

  removeChangeListener: (callback) ->
    @removeListener(CHANGE_EVENT, callback)

  emitChange: ->
    @emit(CHANGE_EVENT)

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when constants.ActionTypes.INSTALLED_COMPONENTS_LOAD_SUCCESS
      _installedComponents = Immutable.fromJS action.components
      _isLoaded = true
      InstalledComponentsStore.emitChange()



module.exports = InstalledComponentsStore