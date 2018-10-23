React = require 'react'
DocumentTitle = React.createFactory(require 'react-document-title')

createStoreMixin = require('../mixins/createStoreMixin').default
RoutesStore = require '../../stores/RoutesStore'
ApplicationStore = require '../../stores/ApplicationStore'

flattenBreadcrumbs = (breadcrumbs) ->
  breadcrumbs
  .map (page) ->
    page.get 'title'
  .join ' / '

module.exports = React.createClass
  displayName: 'PageTitle'
  mixins: [createStoreMixin(RoutesStore)]

  getStateFromStores: ->
    breadcrumbs: RoutesStore.getBreadcrumbs()
    isPlaying: RoutesStore.getCurrentRouteIsRunning()
    pageTitle: ApplicationStore.getCurrentProject().get('name')

  render: ->
    DocumentTitle title: @pageTitle()

  pageTitle: ->
    "#{@playIcon()} #{@state.pageTitle} - #{flattenBreadcrumbs(@state.breadcrumbs)}"

  playIcon: ->
    if @state.isPlaying
      '▶ '
    else
      ''