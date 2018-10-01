React = require 'react'
createStoreMixin = require '../../../../react/mixins/createStoreMixin'
OrchestrationsStore = require('../../stores/OrchestrationsStore').default
RoutesStore = require '../../../../stores/RoutesStore'
OrchestrationsActionCreators = require '../../ActionCreators'
EditButtons = React.createFactory(require '../../../../react/common/EditButtons')

module.exports = React.createClass
  displayName: 'OrchestrationNotificationsButtons'
  mixins: [createStoreMixin(OrchestrationsStore)]

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    orchestrationId = RoutesStore.getCurrentRouteIntParam 'orchestrationId'
    orchestrationId: orchestrationId
    isEditing: OrchestrationsStore.isEditing(orchestrationId, 'notifications')
    isSaving: OrchestrationsStore.isSaving(orchestrationId, 'notifications')

  _handleSave: ->
    OrchestrationsActionCreators.saveOrchestrationNotificationsEdit(@state.orchestrationId)

  _handleCancel: ->
    OrchestrationsActionCreators.cancelOrchestrationNotificationsEdit(@state.orchestrationId)

  _handleStart: ->
    OrchestrationsActionCreators.startOrchestrationNotificationsEdit(@state.orchestrationId)

  render: ->
    EditButtons
      isEditing: @state.isEditing
      isSaving: @state.isSaving
      editLabel: 'Edit Notifications'
      onCancel: @_handleCancel
      onSave: @_handleSave
      onEditStart: @_handleStart
