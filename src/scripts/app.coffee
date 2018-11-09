console.time('load')

require './utils/react-shim'
require './utils/ReactErrorHandler'

React = require 'react'
ReactDOM = require 'react-dom'
Router = require 'react-router'
Promise = require 'bluebird'
_ = require 'underscore'
Immutable = require 'immutable'

routes = require('./routes').default
createReactRouterRoutes = require('./utils/createReactRouterRoutes').default
Timer = require('./utils/Timer').default
Error = require('./utils/Error').default

ApplicationActionCreators = require('./actions/ApplicationActionCreators').default
RouterActionCreators = require('./actions/RouterActionCreators').default

HiddenComponents = require('./modules/components/utils/hiddenComponents').default

RoutesStore = require './stores/RoutesStore'
initializeData = require './initializeData'

ErrorNotification = require('./react/common/ErrorNotification').default

###
  Bootstrap and start whole application
  appOptions:
    - data - initial data
    - rootNode - mount element
    - locationMode - hash or pushState location
###
console.timeEnd('load')
startApp = (appOptions) ->

  initializeData(appOptions.data)

  ApplicationActionCreators.receiveApplicationData(
    sapiUrl: appOptions.data.sapi.url
    sapiToken: appOptions.data.sapi.token
    organizations: appOptions.data.organizations
    maintainers: appOptions.data.maintainers
    notifications: appOptions.data.notifications
    projectTemplates: appOptions.data.projectTemplates
    kbc: appOptions.data.kbc
    tokenStats: appOptions.data.tokenStats
  )

  routes = HiddenComponents.filterHiddenRoutes(routes)
  RouterActionCreators.routesConfigurationReceive(routes)

  router = Router.create(
    routes: createReactRouterRoutes(_.extend {}, routes,
      path: appOptions.data.kbc.projectBaseUrl
    )
    location: if appOptions.locationMode == 'history' then Router.HistoryLocation else Router.HashLocation
  )

  Promise.longStackTraces()
  # error thrown during application live not on route chage
  Promise.onPossiblyUnhandledRejection (e) ->
    error = Error.create(e)

    notification = React.createClass
      render: ->
        React.createElement ErrorNotification,
          error: error

    ApplicationActionCreators.sendNotification
      message: notification
      type: 'error'
      id: error.id

    if !error.isUserError
      throw e

  # Show loading page before app is ready
  loading = _.once (Handler) ->
    ReactDOM.render(React.createElement(Handler, isLoading: true), appOptions.rootNode)

  # registered pollers for previous page
  registeredPollers = Immutable.List()

  RouterActionCreators.routerCreated router

  pendingPromise = null

  # re-render after each route change
  router.run (Handler, state) ->
    # avoid state mutation by router
    state = _.extend {}, state,
      routes: _.map state.routes, (route) ->
        # convert to plain object
        _.extend {}, route

    if pendingPromise
      pendingPromise.cancel()

    RouterActionCreators.routeChangeStart(state)

    # run only once on first render
    loading(Handler)

    # stop pollers required by previous page
    registeredPollers.forEach((action) ->
      Timer.stop(action)
    )

    # async data handling inspired by https://github.com/rackt/react-router/blob/master/examples/async-data/app.js
    promises = RoutesStore
      .getRequireDataFunctionsForRouterState(state.routes)
      .map((requireData) ->
        requireData(state.params, state.query)
      ).toArray()

    # wait for data and trigger render
    pendingPromise = Promise.all(promises)
    .cancellable()
    .then(->
      RouterActionCreators.routeChangeSuccess(state)
      ReactDOM.render(React.createElement(Handler), appOptions.rootNode)

      # Start pollers for new page
      registeredPollers = RoutesStore
        .getPollersForRoutes(state.routes)
        .map((poller) ->
          callback = -> poller.get('action')(state.params)
          Timer.poll(callback, poller.get('interval'))
          return callback
        )

    )
    .catch Promise.CancellationError, (e) ->
      console.log 'cancelled route'
    .catch((error) ->
      # render error page
      console.log 'route change error', error
      RouterActionCreators.routeChangeError(error)
      ReactDOM.render(React.createElement(Handler, isError: true), appOptions.rootNode)
    )

module.exports =
  start: startApp
  helpers: require './helpers'
