React = require 'react'

createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require '../../../../../stores/RoutesStore'
ComponentsStore = require '../../../stores/ComponentsStore'
NewConfigurationsStore = require '../../../stores/NewConfigurationsStore'

NewConfigurationsActionCreators = require('../../../NewConfigurationsActionCreators').default

DefaultForm = require './DefaultForm'
GoodDataWriterForm = require './GoodDataWriterForm'
ManualConfigurationForm = require './ManualConfigurationFrom'

hiddenComponents = require('../../../../components/utils/hiddenComponents').default

{div} = React.DOM

Button = React.createFactory(require('react-bootstrap').Button)

module.exports = React.createClass
  displayName: 'NewComponentModal'
  mixins: [createStoreMixin(NewConfigurationsStore)]

  propTypes:
    component: React.PropTypes.object.isRequired
    onClose: React.PropTypes.func.isRequired

  getStateFromStores: ->
    componentId = @props.component.get('id')
    configuration: NewConfigurationsStore.getConfiguration(componentId)
    isValid: NewConfigurationsStore.isValidConfiguration(componentId)
    isSaving: NewConfigurationsStore.isSavingConfiguration(componentId)

  componentDidMount: ->
    NewConfigurationsActionCreators.resetConfiguration(@props.component.get 'id')

  _handleReset: ->
    @props.onClose()

  _handleChange: (newConfiguration) ->
    NewConfigurationsActionCreators.updateConfiguration(@props.component.get('id'), newConfiguration)

  _handleSave: ->
    NewConfigurationsActionCreators.saveConfiguration(@props.component.get('id'))

  render: ->
    React.createElement @_getFormHandler(),
      component: @props.component
      configuration: @state.configuration
      isValid: @state.isValid
      isSaving: @state.isSaving
      onCancel: @_handleReset
      onChange: @_handleChange
      onSave: @_handleSave
      onClose: @props.onClose

  _getFormHandler: ->
    hasUI = @props.component.get('hasUI') or
      hiddenComponents.hasDevelPreview(@props.component.get('id')) or
      @props.component.get('flags').includes('genericUI') or
      @props.component.get('flags').includes('genericDockerUI') or
      @props.component.get('flags').includes('genericTemplatesUI')

    if !hasUI
      return ManualConfigurationForm

    switch @props.component.get('id')
      when 'gooddata-writer' then GoodDataWriterForm
      else DefaultForm
