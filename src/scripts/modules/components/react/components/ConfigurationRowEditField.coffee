
React = require 'react'

createStoreMixin = require('../../../../react/mixins/createStoreMixin').default
immutableMixin = require 'react-immutable-render-mixin'
InstalledComponentsStore = require '../../stores/InstalledComponentsStore'
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'

{button, span} = React.DOM

module.exports = React.createClass
  displayName: "ConfigurationRowEditField"
  mixins: [createStoreMixin(InstalledComponentsStore), immutableMixin]
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired
    rowId: React.PropTypes.string.isRequired
    fieldName: React.PropTypes.string.isRequired
    editElement: React.PropTypes.func.isRequired
    placeholder: React.PropTypes.string
    fallbackValue: React.PropTypes.string
    tooltipPlacement: React.PropTypes.string

  getDefaultProps: ->
    tooltipPlacement: 'top'

  componentWillReceiveProps: (nextProps) ->
    @setState(@getState(nextProps))

  getStateFromStores: ->
    @getState @props

  getState: (props) ->
    value = InstalledComponentsStore.getConfigRow(
      props.componentId, props.configId, props.rowId
    ).get(props.fieldName)
    if value == '' && props.fallbackValue
      value  = props.fallbackValue
    value: value
    editValue: InstalledComponentsStore.getEditingConfigRow(
      props.componentId, props.configId, props.rowId, props.fieldName
    )
    isEditing: InstalledComponentsStore.isEditingConfigRow(
      props.componentId, props.configId, props.rowId, props.fieldName
    )
    isSaving: InstalledComponentsStore.isSavingConfigRow(
      props.componentId, props.configId, props.rowId, props.fieldName
    )
    isValid: InstalledComponentsStore.isValidEditingConfigRow(
      props.componentId, props.configId, props.rowId, props.fieldName
    )

  _handleEditStart: ->
    InstalledComponentsActionCreators.startConfigurationRowEdit(
      @props.componentId, @props.configId, @props.rowId, @props.fieldName, @props.fallbackValue
    )

  _handleEditCancel: ->
    InstalledComponentsActionCreators.cancelConfigurationRowEdit(
      @props.componentId, @props.configId, @props.rowId, @props.fieldName
    )

  _handleEditChange: (newValue) ->
    InstalledComponentsActionCreators.updateEditingConfigurationRow(
      @props.componentId,
      @props.configId,
      @props.rowId,
      @props.fieldName,
      newValue
    )

  _handleEditSubmit: ->
    InstalledComponentsActionCreators.saveConfigurationRowEdit(
      @props.componentId, @props.configId, @props.rowId, @props.fieldName
    )

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
