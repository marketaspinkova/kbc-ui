React = require 'react'

NewOrchestrationButton = require './NewOrchestionButton'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
OrchestrationsStore = require('../../stores/OrchestrationsStore').default

{button, span} = React.DOM

module.exports = React.createClass
  displayName: 'NewOrchestrationButton'
  mixins: [createStoreMixin(OrchestrationsStore)]

  getStateFromStores: ->
    hasOrchestrations: OrchestrationsStore.getAll().count()

  render: ->
    if @state.hasOrchestrations
      React.createElement NewOrchestrationButton
    else
      false
