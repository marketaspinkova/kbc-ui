React = require 'react'

Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
Button = React.createFactory(require('react-bootstrap').Button)
ConfirmButtons = require('../../../../react/common/ConfirmButtons').default
CronScheduler = require '../../../../react/common/CronScheduler'

OrchestrationsApi = require '../../OrchestrationsApi'
actionCreators = require '../../ActionCreators'
VersionsActionCreators = require '../../../components/VersionsActionCreators'

{div, i, a, strong, form, input, label} = React.DOM

module.exports = React.createClass
  displayName: 'Schedule'
  propTypes:
    orchestrationId: React.PropTypes.number.isRequired
    crontabRecord: React.PropTypes.string

  getInitialState: ->
    crontabRecord: @props.crontabRecord || '0 0 * * *'
    isSaving: false
    showModal: false

  close: ->
    @setState
      showModal: false

  open: (e) ->
    e.preventDefault()
    @setState
      showModal: true
      crontabRecord: @props.crontabRecord || '0 0 * * *'

  render: ->
    div null,
      @renderOpenButton()
      Modal
        show: @state.showModal
        onHide: @close
        keyboard: false
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'Orchestration Schedule'

        ModalBody null,
          React.createElement CronScheduler,
            crontabRecord: @state.crontabRecord
            onChange: @_handleCrontabChange

        ModalFooter null,
          div null,
            div className: 'col-sm-6',
              Button
                className: 'pull-left'
                bsStyle: 'danger'
                onClick: @_handleRemoveSchedule
                disabled: @state.isSaving
              ,
                'Remove Schedule'
            div className: 'col-sm-6',
              React.createElement ConfirmButtons,
                isSaving: @state.isSaving
                isDisabled: false
                saveLabel: 'Save'
                onCancel: @close
                onSave: @_handleSave

  renderOpenButton: ->
    a
      onClick: @open
      href: ''
    ,
      i className: 'fa fa-edit'
      ' Edit schedule'

  _handleRemoveSchedule: ->
    @_save null

  _handleSave: ->
    @_save @state.crontabRecord

  _save: (crontabRecord) ->
    @setState
      isSaving: true

    OrchestrationsApi
    .updateOrchestration @props.orchestrationId,
      crontabRecord: crontabRecord
    .then @_handleSaveSuccess
    .catch (e) ->
      console.log 'error', e

  _handleSaveSuccess: (response) ->
    VersionsActionCreators.loadVersionsForce 'orchestrator', @props.orchestrationId.toString()
    actionCreators
    .receiveOrchestration response
    @setState
      isSaving: false
    @close()

  _handleCrontabChange: (newValue) ->
    @setState
      crontabRecord: newValue
