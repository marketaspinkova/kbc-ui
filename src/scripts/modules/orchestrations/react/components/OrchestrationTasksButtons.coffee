React = require 'react'
createStoreMixin = require '../../../../react/mixins/createStoreMixin'
OrchestrationsStore = require('../../stores/OrchestrationsStore').default
RoutesStore = require '../../../../stores/RoutesStore'
OrchestrationsActionCreators = require '../../ActionCreators'
EditButtons = React.createFactory(require '../../../../react/common/EditButtons')

module.exports = React.createClass
  displayName: 'OrchestrationTasksButtons'
  mixins: [createStoreMixin(OrchestrationsStore)]

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    orchestrationId = RoutesStore.getCurrentRouteIntParam 'orchestrationId'
    orchestrationId: orchestrationId
    isEditing: OrchestrationsStore.isEditing(orchestrationId, 'tasks')
    isSaving: OrchestrationsStore.isSaving(orchestrationId, 'tasks')

  _handleSave: ->
    OrchestrationsActionCreators.saveOrchestrationTasks(@state.orchestrationId)

  _handleCancel: ->
    OrchestrationsActionCreators.cancelOrchestrationTasksEdit(@state.orchestrationId)

  _handleStart: ->
    OrchestrationsActionCreators.startOrchestrationTasksEdit(@state.orchestrationId)

  render: ->
    EditButtons
      isEditing: @state.isEditing
      isSaving: @state.isSaving
      editLabel: 'Edit Tasks'
      onCancel: @_handleCancel
      onSave: @_handleSave
      onEditStart: @_handleStart
