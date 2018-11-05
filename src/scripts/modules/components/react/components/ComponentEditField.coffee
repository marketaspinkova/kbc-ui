React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
immutableMixin = require 'react-immutable-render-mixin'
InstalledComponentsStore = require('../../stores/InstalledComponentsStore').default
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'

{button, span} = React.DOM

module.exports = React.createClass
  displayName: "ComponentEditField"
  mixins: [createStoreMixin(InstalledComponentsStore), immutableMixin]
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired
    fieldName: React.PropTypes.string.isRequired
    editElement: React.PropTypes.func.isRequired
    placeholder: React.PropTypes.string
    tooltipPlacement: React.PropTypes.string

  getDefaultProps: ->
    placeholder: 'Describe the component ...'
    tooltipPlacement: 'top'

  componentWillReceiveProps: (nextProps) ->
    @setState(@getState(nextProps))

  getStateFromStores: ->
    @getState @props

  getState: (props) ->
    value: InstalledComponentsStore.getConfig(props.componentId, props.configId).get props.fieldName
    editValue: InstalledComponentsStore.getEditingConfig props.componentId, props.configId, props.fieldName
    isEditing: InstalledComponentsStore.isEditingConfig props.componentId, props.configId, props.fieldName
    isSaving: InstalledComponentsStore.isSavingConfig props.componentId, props.configId, props.fieldName
    isValid: InstalledComponentsStore.isValidEditingConfig props.componentId, props.configId, props.fieldName

  _handleEditStart: ->
    InstalledComponentsActionCreators.startConfigurationEdit(@props.componentId, @props.configId, @props.fieldName)

  _handleEditCancel: ->
    InstalledComponentsActionCreators.cancelConfigurationEdit(@props.componentId, @props.configId, @props.fieldName)

  _handleEditChange: (newValue) ->
    InstalledComponentsActionCreators.updateEditingConfiguration(
      @props.componentId,
      @props.configId,
      @props.fieldName,
      newValue
    )

  _handleEditSubmit: ->
    InstalledComponentsActionCreators.saveConfigurationEdit(@props.componentId, @props.configId, @props.fieldName)

  render: ->
    React.createElement @props.editElement,
      text: if @state.isEditing then @state.editValue else @state.value
      placeholder: @props.placeholder
      tooltipPlacement: @props.tooltipPlacement
      isSaving: @state.isSaving
      isEditing: @state.isEditing
      isValid: @state.isValid
      onEditStart: @_handleEditStart
      onEditCancel: @_handleEditCancel
      onEditChange: @_handleEditChange
      onEditSubmit: @_handleEditSubmit
