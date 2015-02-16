React = require 'react'
_ = require 'underscore'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
ComponentIcon = React.createFactory(require '../../../../react/common/ComponentIcon')
InstalledComponentsStore = require '../../stores/InstalledComponentsStore'
RoutesStore =  require '../../../../stores/RoutesStore'
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'
Link = React.createFactory require('react-router').Link

{div, table, tbody, tr, td, ul, li, a, span, small} = React.DOM

createComponentsIndex = (type) ->

  React.createClass
    displayName: 'InstalledComponents'
    mixins: [createStoreMixin(InstalledComponentsStore)]

    getStateFromStores: ->
      installedComponents: InstalledComponentsStore.getAllForType(type)

    render: ->
      rows =  @state.installedComponents.map((component) ->
        @renderComponentRow component
      , @).toArray()

      div className: 'container-fluid kbc-main-content',
        table className: 'table table-bordered kbc-table-full-width kbc-extractors-table',
          tbody null, rows

    renderComponentRow: (component) ->
      tr key: component.get('id'),
        td null,
          ComponentIcon(component: component, size: '32')
          component.get('name')
        td null, @renderConfigs(component)

    renderConfigs: (component) ->
      ul null,
        component.get('configurations').map((config) ->
          li key: config.get('id'),
            if RoutesStore.hasRoute(component.get('id'))
              Link
                to: component.get('id')
                params:
                  config: config.get('id')
              ,
                config.get('name')
            else
              span null,
                config.get('name')
            span className: 'kbc-icon-arrow-right'
            if config.get 'description'
              small null, config.get('description')
        ).toArray()


module.exports = createComponentsIndex