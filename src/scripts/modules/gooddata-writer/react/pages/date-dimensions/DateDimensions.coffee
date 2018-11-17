React = require 'react'

createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require('../../../../../stores/RoutesStore').default
goodDataWriterStore = require '../../../store'

dateDimensionsStore = require '../../../dateDimensionsStore'
actionCreators = require '../../../actionCreators'


DateDimensionsTable = require('./DateDimensionsTable').default
NewDimensionForm = require('./../../components/NewDimensionForm').default

{strong, br, ul, li, div, span, i} = React.DOM


module.exports = React.createClass
  displayName: 'DateDimensions'
  mixins: [createStoreMixin(dateDimensionsStore, goodDataWriterStore)]

  getStateFromStores: ->
    configurationId = RoutesStore.getCurrentRouteParam('config')
    writer = goodDataWriterStore.getWriter(configurationId)

    dimensions: dateDimensionsStore.getAll(configurationId)
    isCreatingNewDimension: dateDimensionsStore.isCreatingNewDimension(configurationId)
    configurationId: configurationId
    newDimension: dateDimensionsStore.getNewDimension(configurationId)
    pid: writer.getIn(['config', 'project', 'id'])


  _handleNewDimensionSave: ->
    actionCreators.saveNewDateDimension(@state.configurationId)

  _handleNewDimensionUpdate: (newDimension) ->
    actionCreators.updateNewDateDimension(@state.configurationId, newDimension)

  render: ->
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        div className: 'kbc-main-content-with-sidebar col-sm-8',
          React.createElement DateDimensionsTable,
            pid: @state.pid
            dimensions: @state.dimensions
            configurationId: @state.configurationId
        div className: 'col-sm-4',
          React.createElement NewDimensionForm,
            isPending: @state.isCreatingNewDimension
            dimension: @state.newDimension
            onChange: @_handleNewDimensionUpdate
            onSubmit: @_handleNewDimensionSave
