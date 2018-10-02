React = require 'react'
Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
CodeMirror = React.createFactory(require('react-code-mirror'))
Tooltip = React.createFactory(require('../../../../react/common/Tooltip').default)

require('codemirror/addon/lint/lint')
require('../../../../utils/codemirror/json-lint')

{span, i} = React.DOM

TaskParametersEdit = React.createClass
  displayName: 'TaskParametersEdit'
  propTypes:
    parameters: React.PropTypes.object.isRequired
    onSet: React.PropTypes.func
    isEditable: React.PropTypes.bool

  getInitialState: ->
    parameters: @props.parameters
    parametersString: JSON.stringify @props.parameters, null, '\t'
    isValid: true
    showModal: false

  close: ->
    @setState
      showModal: false

  open: ->
    @setState
      showModal: true

  getDefaultProps: ->
    isEditable: true

  renderJsonArea: ->
    CodeMirror
      theme: 'solarized'
      lineNumbers: true
      defaultValue: @state.parametersString
      readOnly: not @props.isEditable
      cursorHeight: 0 if not @props.isEditable
      height: 'auto'
      mode: 'application/json'
      lineWrapping: true
      autoFocus: @props.isEditable
      onChange: @_handleChange
      lint: true
      gutters: ['CodeMirror-lint-markers']

  render: ->
    span null,
      @renderOpenButton()
      Modal
        show: @state.showModal
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'Task parameters'

        ModalBody style: {padding: 0},
          @renderJsonArea()

        ModalFooter null,
          if @props.isEditable
            ButtonToolbar null,
              Button
                bsStyle: 'link'
                onClick: @close
              ,
                'Cancel'
              Button
                bsStyle: 'primary'
                disabled: !@state.isValid
                onClick: @_handleSet
              ,
                'Set'

  renderOpenButton: ->
    Button
      onClick: @open
      bsStyle: 'link'
    ,
      Tooltip
        placement: 'top'
        tooltip: 'Task parameters'
        i className: 'fa fa-fw fa-ellipsis-h fa-lg'

  _handleChange: (e) ->
    @setState
      parametersString: e.target.value
    try
      @setState
        parameters: JSON.parse(e.target.value)
        isValid: true
    catch error
      @setState
        isValid: false

  _handleSet: ->
    @close()
    @props.onSet @state.parameters

module.exports = TaskParametersEdit
