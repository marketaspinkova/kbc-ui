Dispatcher = require('../Dispatcher')
Immutable = require 'immutable'
Map = Immutable.Map
List = Immutable.List
Error = require '../utils/Error'
StoreUtils = require '../utils/StoreUtils'
_ = require 'underscore'
JobsStore = require('../modules/jobs/stores/JobsStore').default
ComponentsConstants = require('../modules/components/Constants').ActionTypes
{GENERIC_DETAIL_PREFIX} = require('../modules/components/Constants').Routes
Immutable = require('immutable')
Constants = require '../constants/KbcConstants'

_store = Map(
  router: null
  isPending: false
  routerState: Map()
  routesByName: Map()
  breadcrumbs: List()
)

genericDetailRoutesNames = ['extractor', 'writer', 'application']
  .map((componentType) ->
    GENERIC_DETAIL_PREFIX + componentType + '-config'
  )


###
  Converts nested routes structure to flat Map indexed by route name
###
nestedRoutesToByNameMap = (route) ->
  map = {}
  traverse  = (route) ->
    if route.name
      map[route.name] = route

    if route.childRoutes
      route.childRoutes.forEach traverse

  traverse(route)
  Immutable.fromJS map

getRoute = (store, routeName) ->
  route = store.getIn ['routesByName', routeName]

  if !route
    route = store.get('routesByName').find((route) -> route.get('defaultRouteName') == routeName)

  route

###
 Returns title for route
###
getRouteTitle = (store, routeName) ->
  route = getRoute(store, routeName)
  title = if route then route.get 'title' else ''

  if _.isFunction title
    title(store.get 'routerState')
  else
    title

getRouteSettings = (store, routeName) ->
  route = getRoute(store, routeName)
  if route then route.get 'settings' else Map()

getRouteIsRunning = (store, routeName) ->
  route = getRoute(store, routeName)
  isRunning = if route then route.get 'isRunning' else false
  if _.isFunction isRunning
    isRunning(store.get 'routerState')
  else
    isRunning

getCurrentRouteName = (store) ->
  routes = store.getIn ['routerState', 'routes'], List()
  route = routes.findLast((route) ->
    !!route.get('name')
  )
  if route
    route.get 'name'
  else
    null

generateBreadcrumbs = (store) ->
  if store.has 'error'
    List.of(
      Map(
        name: 'error'
        title: store.get('error').getTitle()
      )
    )
  else
    currentParams = store.getIn ['routerState', 'params']
    store.getIn(['routerState', 'routes'], List())
      .shift()
      .filter((route) -> !!route.get 'name')
      .map((route) ->
        Map(
          title: getRouteTitle(store, route.get 'name')
          name: route.get 'name'
          link: Map(
            to: route.get 'name'
            params: currentParams
          )
        )
      )


RoutesStore = StoreUtils.createStore

  isError: ->
    _store.has 'error'

  getRouter: ->
    _store.get 'router'

  getBreadcrumbs: ->
    _store.get 'breadcrumbs'

  getCurrentRouteConfig: ->
    _store.getIn ['routesByName', getCurrentRouteName(_store)]

  getRouterState: ->
    _store.get 'routerState'

  getComponentId: (defaultValue) ->
    if @getRouterState().hasIn(['params', 'component'])
      return @getRouterState().getIn(['params', 'component'])
    if @getRouterState().hasIn(['params', 'componentId'])
      return @getRouterState().getIn(['params', 'componentId'])
    settings = @getRouteSettings()
    if (settings && settings.has('componentId'))
      return settings.get('componentId')
    return defaultValue

  getConfigId: (defaultValue) ->
    if @getRouterState().hasIn(['params', 'config'])
      return @getRouterState().getIn(['params', 'config'])
    if @getRouterState().hasIn(['params', 'configId'])
      return @getRouterState().getIn(['params', 'configId'])
    return defaultValue


  getCurrentRouteParam: (paramName, defaultValue = null) ->
    if (paramName == 'config' || paramName == 'configId')
      return @getConfigId(defaultValue)

    if (paramName == 'component' || paramName == 'componentId')
      return @getComponentId(defaultValue)

    @getRouterState().getIn ['params', paramName], defaultValue

  getCurrentRouteIntParam: (paramName) ->
    parseInt(@getCurrentRouteParam paramName)

  getCurrentRouteTitle: ->
    currentRouteName = getCurrentRouteName(_store)
    getRouteTitle(_store, currentRouteName)

  getCurrentRouteIsRunning: ->
    currentRouteName = getCurrentRouteName(_store)
    getRouteIsRunning(_store, currentRouteName)

  getRouteSettings: ->
    currentRouteName = getCurrentRouteName(_store)
    getRouteSettings(_store, currentRouteName)


  ###
    If it'is a component route, component id is returned
    componet is some writer or extractor like wr-db or ex-db
  ###
  getCurrentRouteComponentId: ->
    foundRoute = _store
    .getIn(['routerState', 'routes'], List())
    .find (route) ->
      routeConfig = getRoute _store, route.get('name')
      return false if !routeConfig
      routeConfig.get 'isComponent', false

    # generic-detail route has component param, otherwise componentId is route name
    return @getCurrentRouteParam('component', foundRoute.get('name')) if foundRoute


  ###
    Returns if route change is pending
  ###
  getIsPending: ->
    _store.get 'isPending'

  ###
    @return Error
  ###
  getError: ->
    _store.get 'error'

  hasRoute: (routeName) ->
    !!getRoute(_store, routeName)

  getRequireDataFunctionsForRouterState: (routes) ->
    Immutable
      .fromJS(routes)
      .map((route) ->
        requireDataFunctions = _store.getIn ['routesByName', route.get('name'), 'requireData']
        if !Immutable.List.isList(requireDataFunctions)
          requireDataFunctions = Immutable.List.of(requireDataFunctions)
        requireDataFunctions
      )
      .flatten()
      .filter((func) -> _.isFunction func)

  getPollersForRoutes: (routes) ->
    route = Immutable
      .fromJS(routes)
      .filter((route) -> !!route.get 'name')
      .last() # use poller only from last route in hiearchy

    pollerFunctions = _store.getIn ['routesByName', route.get('name'), 'poll'], List()
    if !Immutable.List.isList(pollerFunctions)
      pollerFunctions = Immutable.List.of(pollerFunctions)

    pollerFunctions

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type

    when Constants.ActionTypes.ROUTER_ROUTE_CHANGE_START
      # set pending only if path was changed - will not show pending indicator when only query is change
      # like search in jobs
      currentState = RoutesStore.getRouterState()
      if !(currentState && currentState.get('pathname') == action.routerState.pathname)
        _store = _store.set 'isPending', true

    when Constants.ActionTypes.ROUTER_ROUTE_CHANGE_SUCCESS
      # jobs status (playing icon in header) can be changed so wait for it
      Dispatcher.waitFor([JobsStore.dispatchToken])

      _store = _store.withMutations (store) ->
        newState = Immutable.fromJS(action.routerState)
        notFound = newState.get('routes').last().get('name') == 'notFound'

        store = store.set 'isPending', false
        if notFound
          store
            .set 'error', new Error.Error('Page not found', 'Page not found')
            .set 'routerState', newState
        else
          store
            .remove 'error'
            .set 'routerState', newState

        store = store.set 'breadcrumbs', generateBreadcrumbs(store)
        store

    when Constants.ActionTypes.ROUTER_ROUTE_CHANGE_ERROR
      _store = _store.withMutations (store) ->
        store = store
          .set 'isPending', false
          .set 'error', Error.create(action.error)

        store.set 'breadcrumbs', generateBreadcrumbs(store)

    when Constants.ActionTypes.ROUTER_ROUTES_CONFIGURATION_RECEIVE
      _store = _store.set 'routesByName', nestedRoutesToByNameMap(action.routes)

    when Constants.ActionTypes.ROUTER_ROUTER_CREATED
      _store = _store.set 'router', action.router

    when ComponentsConstants.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS
      componentId = action.componentId
      configId = action.configId
      configName = action.data.name

      # update breadcrumb title for generic-detail component route
      breadcrumbs = _store.get('breadcrumbs').map((breadcrumb) ->
        linkParams = breadcrumb.getIn(['link', 'params'], Map())
        routeName = breadcrumb.get('name')
        isConfigLink = linkParams.get('config') == configId
        isComponentLink = linkParams.get('component') == componentId
        isGenericComponentRoute = isConfigLink and isComponentLink and routeName in genericDetailRoutesNames
        isComponentRoute = isConfigLink and routeName == componentId
        isTransformationRoute = isConfigLink and routeName == 'transformationBucket'
        if isGenericComponentRoute or isComponentRoute or isTransformationRoute
          breadcrumb.set('title', configName)
        else
          breadcrumb
        )
      _store = _store.set('breadcrumbs', breadcrumbs)

  # Emit change on events
  # for example orchestration is loaed asynchronously while breadcrumbs are already rendered so it has to be rendered again
  RoutesStore.emitChange()


module.exports = RoutesStore
