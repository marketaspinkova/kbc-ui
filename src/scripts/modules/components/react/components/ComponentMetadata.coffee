React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
immutableMixin = require 'react-immutable-render-mixin'
InstalledComponentsStore = require('../../stores/InstalledComponentsStore').default
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'
date = require '../../../../utils/date'

{button, span} = React.DOM

ComponentMetadata = React.createClass
  displayName: "ComponentMetadata"
  propTypes:
    config: React.PropTypes.object.isRequired
  render: ->
    React.DOM.div null,
      React.DOM.div null,
        'Created by '
        React.DOM.strong null,
          @props.config.getIn ['creatorToken', 'description']
      React.DOM.div null,
        React.DOM.small null,
          'on '
          React.DOM.strong null,
            date.format(@props.config.get 'created')

module.exports = React.createClass
  displayName: "ComponentMetadataWrapper"
  mixins: [createStoreMixin(InstalledComponentsStore), immutableMixin]
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired

  getStateFromStores: ->
    config: InstalledComponentsStore.getConfig @props.componentId, @props.configId

  render: ->
    React.createElement ComponentMetadata,
      config: @state.config
