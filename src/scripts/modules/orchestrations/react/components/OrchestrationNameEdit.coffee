
React = require 'react'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
immutableMixin = require 'react-immutable-render-mixin'
OrchestrationsStore = require('../../stores/OrchestrationsStore').default
actionCreators = require '../../ActionCreators'

InlineEditTextInput = require '../../../../react/common/InlineEditTextInput'

{button, span} = React.DOM
FIELD = 'name'

module.exports = React.createClass
  displayName: "OrchestrationNameEdit"
  mixins: [createStoreMixin(OrchestrationsStore), immutableMixin]
  propTypes:
    orchestrationId: React.PropTypes.number.isRequired

  getStateFromStores: ->
    @getStateForOrchestration(@props.orchestrationId)

  getStateForOrchestration: (orchestrationId) ->
    value: OrchestrationsStore.get(orchestrationId).get FIELD
    editValue: OrchestrationsStore.getEditingValue orchestrationId, FIELD
    isEditing: OrchestrationsStore.isEditing orchestrationId, FIELD
    isSaving: OrchestrationsStore.isSaving orchestrationId, FIELD
    isValid: true

  componentWillReceiveProps: (nextProps) ->
    if nextProps.orchestrationId != @props.orchestrationId
      @setState(@getStateForOrchestration(nextProps.orchestrationId))

  _handleEditStart: ->
    actionCreators.startOrchestrationFieldEdit @props.orchestrationId, FIELD

  _handleEditCancel: ->
    actionCreators.cancelOrchestrationFieldEdit @props.orchestrationId, FIELD

  _handleEditChange: (newValue) ->
    actionCreators.updateOrchestrationFieldEdit @props.orchestrationId, FIELD, newValue

  _handleEditSubmit: ->
    actionCreators.saveOrchestrationField @props.orchestrationId, FIELD

  render: ->
    React.createElement InlineEditTextInput,
      text: if @state.isEditing then @state.editValue else @state.value
      placeholder: 'Name the component ...'
      tooltipPlacement: 'bottom'
      isSaving: @state.isSaving
      isEditing: @state.isEditing
      isValid: @state.editValue?.trim() != ''
      onEditStart: @_handleEditStart
      onEditCancel: @_handleEditCancel
      onEditChange: @_handleEditChange
      onEditSubmit: @_handleEditSubmit
