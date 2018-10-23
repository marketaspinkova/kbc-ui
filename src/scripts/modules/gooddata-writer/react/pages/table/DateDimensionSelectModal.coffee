React = require 'react'
Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
Check = React.createFactory(require('@keboola/indigo-ui').Check)
NewDimensionForm = React.createFactory(require('./../../components/NewDimensionForm').default)

{Tabs, Tab} = require 'react-bootstrap'
actionCreators = require '../../../actionCreators'
dateDimensionStore = require '../../../dateDimensionsStore'
createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default

{div, p, span, table, tbody, thead, tr, th, td, div, a} = React.DOM

module.exports = React.createClass
  displayName: 'DateDimensionSelectModal'
  mixins: [createStoreMixin(dateDimensionStore)]
  propTypes:
    configurationId: React.PropTypes.string.isRequired
    column: React.PropTypes.object.isRequired
    onSelect: React.PropTypes.func.isRequired

  componentDidMount: ->
    actionCreators.loadDateDimensions(@props.configurationId)

  getStateFromStores: ->
    isLoading: dateDimensionStore.isLoading(@props.configurationId)
    dimensions: dateDimensionStore.getAll(@props.configurationId)
    isCreatingNewDimension: dateDimensionStore.isCreatingNewDimension(@props.configurationId)
    newDimension: dateDimensionStore.getNewDimension(@props.configurationId)

  _handleNewDimensionSave: ->
    actionCreators
    .saveNewDateDimension(@props.configurationId)
    .then (dateDimension) =>
      @props.onSelect
        selectedDimension: dateDimension.get('name')
      @close()

  _handleNewDimensionUpdate: (newDimension) ->
    actionCreators.updateNewDateDimension(@props.configurationId, newDimension)

  close: ->
    @setState
      showModal: false

  open: ->
    @setState
      showModal: true

  getInitialState: ->
    showModal: false

  render: ->
    span null,
      @renderOpenButton()
      Modal
        bsSize: 'large'
        show: @state.showModal
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            @_title()

        ModalBody null,
          React.createElement Tabs,
            id: 'gooddata-writer-date-dimension-select-modal-tabs',
            className: 'tabs-inside-modal',
            React.createElement Tab,
              eventKey: 'select'
              title: 'Select from existing'
            ,
              if @state.isLoading
                p className: 'panel-body',
                  'Loading ...'
              else
                @_renderTable()
            React.createElement Tab,
              eventKey: 'new'
              title: 'Create new'
            ,
              NewDimensionForm
                isPending: @state.isCreatingNewDimension
                dimension: @state.newDimension
                onChange: @_handleNewDimensionUpdate
                onSubmit: @_handleNewDimensionSave
                buttonLabel: 'Create and select'

        ModalFooter null,
          ButtonToolbar null,
            Button
              onClick: @close
              bsStyle: 'link'
            ,
              'Close'


  _selectDimension: (id) ->
    @props.onSelect
      selectedDimension: id
    @close()

  _renderTable: ->
    if @state.dimensions.count()
      div className: 'table table-striped table-hover',
        div className: 'thead',
          div className: 'tr',
            div className: 'th', 'Name'
            div className: 'th', 'Include time'
            div className: 'th', 'Selected'
        div className: 'tbody',
          @state.dimensions.map (dimension) ->
            a
              className: 'tr'
              key: dimension.get 'name'
              onClick: @_selectDimension.bind @, dimension.get('name')
            ,
              div className: 'td',
                dimension.getIn ['data', 'name']
              div className: 'td',
                Check
                  isChecked: dimension.getIn ['data', 'includeTime']
              div className: 'td',
                if dimension.get('name') == @props.column.get('dateDimension')
                  Check
                    isChecked: true
          , @
          .toArray()
    else
      p className: 'panel-body',
        'There are no date dimensions yet. Please create new one.'

  _title: ->
    "Date dimension for column #{@props.column.get('name')}"

  renderOpenButton: ->
    span
      onClick: @open
      className: 'btn btn-link',
        span className: 'fa fa-calendar'
        ' '
        if @props.column.get('dateDimension')
          'Change'
        else
          'Add'
