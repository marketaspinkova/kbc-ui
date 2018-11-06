Index = require './react/pages/index/Index'
actions = require './wrGdriveActionCreators'
authorizePage = require './react/pages/authorize/Authorize'
InstalledComponentsStore = require('../components/stores/InstalledComponentsStore').default
JobsActionCreators = require('../jobs/ActionCreators').default
storageActionCreators = require '../components/StorageActionCreators'
{createTablesRoute} = require '../table-browser/routes'

module.exports =
  name: 'wr-google-drive'
  isComponent: true
  path: ':config'
  defaultRouteHandler: Index
  poll:
    interval: 7
    action: (params) ->
      JobsActionCreators.loadComponentConfigurationLatestJobs('wr-google-drive', params.config)
  title: (routerState) ->
    configId = routerState.getIn ['params', 'config']
    InstalledComponentsStore.getConfig('wr-google-drive', configId).get 'name'

  requireData: [
    (params) ->
      actions.loadFiles(params.config)
    ,
      ->
        storageActionCreators.loadTables()
    ]
  childRoutes: [
    createTablesRoute('wr-google-drive')
  ,
    name: 'wr-google-drive-authorize'
    path: 'authorize'
    handler: authorizePage
    title: ->
      'Authorize Google Drive account'

  ]
