import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

import GraphCanvas from '../../../../../react/common/GraphCanvas';
import graphUtils from '../../../../../utils/graphUtils';

export default createReactClass({
  propTypes: {
    model: PropTypes.object.isRequired
  },
  mixins: [ImmutableRenderMixin],

  getInitialState() {
    return { direction: 'reverse' };
  },

  _modelData() {
    const model = this.props.model.toJS();
    model.nodes = graphUtils.addLinksToNodes(model.nodes);

    for (let i in model.transitions) {
      if (model.transitions.hasOwnProperty(i)) {
        if (this.state.direction === 'reverse') {
          const { source } = model.transitions[i];
          const { target } = model.transitions[i];
          model.transitions[i].source = target;
          model.transitions[i].target = source;
        }
        if (model.transitions[i].transitive) {
          model.transitions[i].type = model.transitions[i].type + ' transitive';
        }
      }
    }
    return model;
  },

  _renderGraph() {
    this.graph.data = this._modelData();
    this.graph.direction = 'regular';
    this.graph.spacing = 1;
    this.graph.styles = {
      'g.edgePath': {
        fill: 'none',
        stroke: 'grey',
        'stroke-width': '1.5px'
      },
      'g.edgePath.transitive': {
        'stroke-dasharray': '5, 5'
      },
      'g.node text': {
        color: '#ffffff',
        fill: '#ffffff',
        display: 'inline-block',
        padding: '2px 4px',
        'font-size': '12px',
        'font-weight': 'bold',
        'line-height': '14px',
        'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.25)',
        'white-space': 'nowrap',
        'vertical-align': 'baseline'
      },
      'g.node.dataset rect': {
        fill: '#468847'
      },
      'g.node.dimension rect': {
        fill: '#428bca'
      }
    };
    return this.graph.render();
  },

  componentWillUnmount() {
    return window.removeEventListener('resize', this.handleResize);
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.graph = new GraphCanvas({}, this.refs.graph);
    return this._renderGraph();
  },

  _handleZoomIn() {
    return this.graph.zoomIn();
  },

  _handleZoomOut() {
    return this.graph.zoomOut();
  },

  _handleReset() {
    return this.graph.reset();
  },

  handleResize() {
    return this.graph.adjustCanvasWidth();
  },

  _handleChangeDirection(e) {
    const direction = e.target.value;
    return this.setState({ direction }, function() {
      return this._renderGraph();
    });
  },

  render() {
    return (
      <div>
        <div>
          <div className="graph-options">
            <Button bsStyle="link" onClick={this._handleZoomIn}>
              <span className="fa fa-search-plus" />
              {' Zoom in'}
            </Button>
            <Button bsStyle="link" onClick={this._handleZoomOut}>
              <span className="fa fa-search-minus" />
              {' Zoom out'}
            </Button>
            <Button bsStyle="link" onClick={this._handleReset}>
              <span className="fa fa-times" />
              {' Reset'}
            </Button>
            <select
              className="form-control pull-right"
              label="Direction"
              value={this.state.direction}
              onChange={this._handleChangeDirection}
            >
              <option value="regular">Regular</option>
              <option value="reverse">GoodData</option>
            </select>
          </div>
        </div>
        <div>
          <div className="svg" />
          <div id="canGraph" ref="graph" />
        </div>
      </div>
    );
  }
});
