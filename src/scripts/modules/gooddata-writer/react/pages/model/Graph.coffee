React = require 'react'

GraphCanvas = require('../../../../../react/common/GraphCanvas').default
Button = React.createFactory(require('react-bootstrap').Button)
ImmutableRenderMixin = require 'react-immutable-render-mixin'

graphUtils = require('../../../../../utils/graphUtils').default

module.exports = React.createClass
  displayName: 'Graph'
  propTypes:
    model: React.PropTypes.object.isRequired
  mixins: [ImmutableRenderMixin]

  getInitialState: ->
    direction: 'reverse'

  _modelData: ->
    model = @props.model.toJS()
    model.nodes = graphUtils.addLinksToNodes(model.nodes)

    for i of model.transitions
      if (@state.direction == 'reverse')
        source = model.transitions[i].source
        target = model.transitions[i].target
        model.transitions[i].source = target
        model.transitions[i].target = source
      if model.transitions[i].transitive
        model.transitions[i].type = model.transitions[i].type + ' transitive'
    model

  _renderGraph: ->
    @graph.data = @_modelData()
    @graph.direction  = 'regular'
    @graph.spacing = 1
    @graph.styles =
      "g.edgePath":
        "fill": "none"
        "stroke": "grey"
        "stroke-width": "1.5px"
      "g.edgePath.transitive":
        "stroke-dasharray": "5, 5"
      "g.node text":
        "color": "#ffffff"
        "fill": "#ffffff"
        "display": "inline-block"
        "padding": "2px 4px"
        "font-size": "12px"
        "font-weight": "bold"
        "line-height": "14px"
        "text-shadow": "0 -1px 0 rgba(0, 0, 0, 0.25)"
        "white-space": "nowrap"
        "vertical-align": "baseline"
      "g.node.dataset rect":
        "fill": "#468847"
      "g.node.dimension rect":
        "fill": "#428bca"
    @graph.render()


  componentWillUnmount: ->
    window.removeEventListener('resize', @handleResize)

  componentDidMount: ->
    window.addEventListener('resize', @handleResize)
    @graph = new GraphCanvas {}, @refs.graph
    @_renderGraph()

  _handleZoomIn: ->
    @graph.zoomIn()

  _handleZoomOut: ->
    @graph.zoomOut()

  _handleReset: ->
    @graph.reset()

  handleResize: ->
    @graph.adjustCanvasWidth()

  _handleChangeDirection: (e) ->
    direction = e.target.value
    @setState
      direction: direction
    ,
      ->
        @_renderGraph()

  render: ->
    React.DOM.div null,
      React.DOM.div null,
        React.DOM.div className: 'graph-options',
          Button
            bsStyle: 'link'
            onClick: @_handleZoomIn
          ,
            React.DOM.span className: 'fa fa-search-plus'
            ' Zoom in'
          Button
            bsStyle: 'link'
            onClick: @_handleZoomOut
          ,
            React.DOM.span className: 'fa fa-search-minus'
            ' Zoom out'
          Button
            bsStyle: 'link'
            onClick: @_handleReset
          ,
            React.DOM.span className: 'fa fa-times'
            ' Reset'
          React.DOM.select
            className: 'form-control pull-right'
            label: 'Direction'
            value: @state.direction
            onChange: @_handleChangeDirection
          ,
            React.DOM.option value: 'regular',
              'Regular'
            React.DOM.option value: 'reverse',
              'GoodData'

      React.DOM.div null,
        React.DOM.div
          className: 'svg'
        React.DOM.div
          id: 'canGraph'
          ref: 'graph'
