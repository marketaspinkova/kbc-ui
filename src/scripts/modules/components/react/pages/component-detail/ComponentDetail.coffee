React = require 'react'
fuzzy = require('fuzzy')

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
RoutesStore = require '../../../../../stores/RoutesStore'
ComponentsStore = require '../../../stores/ComponentsStore'
InstalledComponentsStore = require '../../../stores/InstalledComponentsStore.coffee'
InstalledComponentsActionCreators = require '../../../InstalledComponentsActionCreators'
ApplicationStore = require '../../../../../stores/ApplicationStore'

VendorInfo = React.createFactory(require './VendorInfo.coffee')
ConfigurationRow = require('../ConfigurationRow').default
Immutable = require 'immutable'
ComponentEmptyState = require('../../components/ComponentEmptyState').default
AddComponentConfigurationButton = React.createFactory(require '../../components/AddComponentConfigurationButton')

FormHeader = require('../new-component-form/FormHeader')
VendorInfo = require('../component-detail/VendorInfo')
AppUsageInfo = React.createFactory(require('../new-component-form/AppUsageInfo').default)
ComponentDescription = require './ComponentDescription'
contactSupport = require('../../../../../utils/contactSupport').default
MigrationRow = require('../../components/MigrationRow').default
SearchBar = require('@keboola/indigo-ui').SearchBar

{a, div, label, h3, h2, span, p} = React.DOM

module.exports = React.createClass
  displayName: 'ComponentDetail'
  mixins: [createStoreMixin(ComponentsStore, InstalledComponentsStore)]
  propTypes:
    component: React.PropTypes.string

  getStateFromStores: ->
    componentId = if @props.component then @props.component else RoutesStore.getCurrentRouteParam('component')
    component = ComponentsStore.getComponent(componentId)

    if (InstalledComponentsStore.getDeletingConfigurations())
      deletingConfigurations = InstalledComponentsStore.getDeletingConfigurations()
    else
      deletingConfigurations = Immutable.Map()

    componentWithConfigurations = InstalledComponentsStore.getComponent(component.get('id'))
    configurations = Immutable.Map()
    if componentWithConfigurations
      configurations = componentWithConfigurations.get("configurations", Immutable.Map())

    state =
      component: component
      configurations: configurations
      deletingConfigurations: deletingConfigurations.get(component.get('id'), Immutable.Map())
      configurationFilter: InstalledComponentsStore.getComponentDetailFilter(component.get('id'))
    state

  render: ->
    div className: "container-fluid",
      if @_isDeprecated()
        React.createElement MigrationRow,
        componentId: @state.component.get('id')
        replacementAppId: @state.component.getIn(['uiOptions', 'replacementApp'])
      div className: "kbc-main-content",
        React.createElement FormHeader,
          component: @state.component
          withButtons: false
        div className: "row",
          div className: "col-md-6",
            AppUsageInfo
              component: @state.component
          div className: "col-md-6",
            React.createElement VendorInfo,
              component: @state.component
        if (@state.component.get('longDescription'))
          div className: "row",
            div className: "col-md-12",
              React.createElement ComponentDescription,
                component: @state.component
        @_renderSearchBar()
        @_renderConfigurations()

  _getFilteredConfigurations: ->
    filtered = @state.configurations
    if @state.configurationFilter or @state.configurationFilter != ''
      filterQuery = @state.configurationFilter.toLowerCase()
      filtered = @state.configurations.filter (configuration) ->
        configuration.get('name', '').toLowerCase().match(filterQuery) or
          configuration.get('id', '').match(filterQuery) or
          configuration.get('description', '').toLowerCase().match(filterQuery)
    return filtered.sortBy (configuration) -> configuration.get('name').toLowerCase()

  _isDeprecated: ->
    return @state.component.get('flags').includes('deprecated')

  _handleFilterChange: (query) ->
    InstalledComponentsActionCreators.setInstalledComponentsComponentDetailFilter(@state.component.get('id'), query)

  _renderSearchBar: ->
    state = @state
    additionalActions = (
      AddComponentConfigurationButton
        disabled: @_isDeprecated()
        component: state.component
    )
    if @state.configurations.count()
      div className: "row-searchbar row-searchbar-no-border-bottom",
        h2 null, "Configurations"
        React.createElement SearchBar,
          onChange: @_handleFilterChange
          query: @state.configurationFilter
          placeholder: 'Search by name, description or id'
          additionalActions: additionalActions

  _renderConfigurations: ->
    hasRedshift = ApplicationStore.getSapiToken().getIn ['owner', 'hasRedshift']
    needsRedshift = @state.component.get('flags').includes('appInfo.redshiftOnly')

    if needsRedshift and not hasRedshift
      return div className: 'row',
        span {},
          "Redshift is not enabled for this project, please "
        ,
          a {onClick: @_openSupportModal}, "contact us"
        ,
          " to get more info."

    state = @state
    if @state.configurations.count()
      if @_getFilteredConfigurations().count()
        div className: "table table-hover",
          div className: "tbody",
            @_getFilteredConfigurations()
              .map((configuration) =>
                React.createElement(ConfigurationRow,
                  component: @state.component,
                  config: configuration,
                  componentId: state.component.get('id'),
                  isDeleting: state.deletingConfigurations.has(configuration.get('id')),
                  key: configuration.get('id')
                )
              )
              .toArray()
      else
        div className: 'kbc-header',
          div className: 'kbc-title',
            h2 null,
              'No configurations found.'
    else
      div className: "row kbc-row",
        React.createElement ComponentEmptyState, null,
          div className: "text-center",
            AddComponentConfigurationButton
              disabled: false
              label: "New Configuration"
              component: state.component

  _openSupportModal: (e) ->
    contactSupport(type: 'project')
    e.preventDefault()
    e.stopPropagation()
