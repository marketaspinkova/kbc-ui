React = require 'react'

createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
RoutesStore = require('../../../../../stores/RoutesStore').default

goodDataWriterStore = require '../../../store'
actionCreators = require '../../../actionCreators'

Graph = require './GraphContainer'

{div, p, a, span} = React.DOM

module.exports = React.createClass
  mixins: [createStoreMixin(goodDataWriterStore)]
  displayName: 'GoodDataModel'

  getStateFromStores: ->
    configurationId = RoutesStore.getCurrentRouteParam('config')
    configurationId: configurationId
    writer: goodDataWriterStore.getWriter configurationId

  render: ->
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        div className: 'row',
          p null,
            'This graph represents the model defined in Keboola Connection.'
            'To see the current model in GoodData, open the '
            a
              href: @_gdModelLink()
            ,
              'GoodData LDM Visualizer'
          p className: 'well',
            span className: 'label label-success',
              'Dataset'
            ' '
            span className: 'label label-primary',
              'Date Dimension'
          React.createElement Graph,
            configurationId: @state.configurationId


  _gdModelLink: ->
    pid = @state.writer.getIn ['config', 'project', 'id']
    "https://secure.gooddata.com/labs/apps/app_link?pid=#{pid}&app=ldm_visualizer"
