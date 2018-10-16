React = require 'react'
createStoreMixin = require '../mixins/createStoreMixin'
Immutable = require 'immutable'

RoutesStore = require '../../stores/RoutesStore'
ComponentsStore = require '../../modules/components/stores/ComponentsStore'
immutableMixin = require 'react-immutable-render-mixin'

Link = React.createFactory(require('react-router').Link)
RoutePendingIndicator = React.createFactory(require './RoutePendingIndicator')
ComponentIcon = React.createFactory(require('../common/ComponentIcon').default)
ComponentNameEdit = React.createFactory(require '../../modules/components/react/components/ComponentName')
ConfiguratinRowName = React.createFactory(
  require('../../modules/configurations/react/components/ConfigurationRowName').default
)
NotificationsAccess = require('../../react/common/NotificationsAccess').default

{div, nav, span, a, h1} = React.DOM


Header = React.createClass
  displayName: 'Header'
  mixins: [createStoreMixin(RoutesStore), immutableMixin]
  propTypes:
    homeUrl: React.PropTypes.string.isRequired
    notifications: React.PropTypes.object.isRequired

  getStateFromStores: ->
    componentId = RoutesStore.getCurrentRouteComponentId()
    component = ComponentsStore.getComponent componentId

    breadcrumbs: RoutesStore.getBreadcrumbs()
    currentRouteConfig: RoutesStore.getCurrentRouteConfig()
    isRoutePending: RoutesStore.getIsPending()
    currentRouteComponentId: RoutesStore.getCurrentRouteComponentId()
    component: component
    currentRouteParams: RoutesStore.getRouterState().get 'params'
    currentRouteQuery: RoutesStore.getRouterState().get 'query'

  render: ->
    nav {className: 'navbar navbar-fixed-top kbc-navbar', role: 'navigation'},
      div {className: 'col-xs-3 kbc-logo'},
        a href: @props.homeUrl,
          span className: "kbc-icon-keboola-logo", null
        @_renderNotifications()
      div {className: 'col-xs-9 col-xs-offset-3 kbc-main-header-container'},
        div {className: 'kbc-main-header kbc-header'},
          div {className: 'kbc-title'},
            @_renderComponentIcon()
            @_renderBreadcrumbs()
            ' '
            @_renderReloader()
            ' '
            RoutePendingIndicator() if @state.isRoutePending
          div {className: 'kbc-buttons'},
            @_renderButtons()

  _renderNotifications: ->
    return null if !@props.notifications.get('isEnabled')

    React.createElement NotificationsAccess,
      notifications: @props.notifications

  _renderComponentIcon: ->
    if @state.component
      span null,
        ComponentIcon component: @state.component
        ' '

  _getCurrentRouteQueryParams: ->
    persistQueryParams = @state.currentRouteConfig.get('persistQueryParams', Immutable.List())
    currentRouteQuery = @state.currentRouteQuery
    queryParams = persistQueryParams.reduce((result, item) ->
      if currentRouteQuery.has(item) and (currentRouteQuery.get(item, '') != '')
        result = result.set(item, currentRouteQuery.get(item))
      result
    ,
      Immutable.Map())
    queryParams.toJS()

  _renderBreadcrumbs: ->
    breadcrumbs = []
    @state.breadcrumbs.forEach((part, i) ->
      if i != @state.breadcrumbs.size - 1
        # all breadcrumbs except last one - these are links
        partElement = Link
          key: part.get('name')
          to: part.getIn(['link', 'to'])
          params: part.getIn(['link', 'params']).toJS()
          query: @_getCurrentRouteQueryParams() # persist chosen query params
        ,
          part.get 'title'
        breadcrumbs.push partElement
        breadcrumbs.push(span className: 'kbc-icon-arrow-right', key: 'arrow-' + part.get('name'))
      else if @state.component && part.getIn(['link', 'to']) == @state.component.get('id')
        # last breadcrumb in case it is a configuration
        # configuration name edit is enabled
        breadcrumbs.push span key: part.get('name'),
          ComponentNameEdit
            componentId: @state.component.get 'id'
            configId: @state.currentRouteParams.get 'config'
      else if @state.component && part.getIn(['link', 'to']) == @state.component.get('id') + '-row'
        # last breadcrumb in case it is a component configuration row detail
        # configuration row name edit is enabled
        breadcrumbs.push span key: part.get('name'),
          ConfiguratinRowName
            componentId: @state.component.get 'id'
            configId: @state.currentRouteParams.get 'config'
            rowId: @state.currentRouteParams.get 'row'
      else if @state.currentRouteConfig?.get 'nameEdit'
        nameEdit = span key: 'name-edit-wrapper',
          @state.currentRouteConfig.get('nameEdit')(
            @state.currentRouteParams.toJS()
          )
        breadcrumbs.push nameEdit
      else
        # last breadcrumb in all other cases
        # just h1 element with text
        partElement = h1 key: part.get('name'), part.get('title')
        breadcrumbs.push partElement
    , @)
    breadcrumbs

  _renderReloader: ->
    if !@state.currentRouteConfig?.get 'reloaderHandler'
      null
    else
      React.createElement(@state.currentRouteConfig.get 'reloaderHandler')

  _renderButtons: ->
    if !@state.currentRouteConfig?.get 'headerButtonsHandler'
      null
    else
      React.createElement(@state.currentRouteConfig.get 'headerButtonsHandler')


module.exports = Header
