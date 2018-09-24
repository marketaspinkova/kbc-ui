import React from 'react';
import GraphCanvas from '../../../../../react/common/GraphCanvas';
import { Button } from 'react-bootstrap';
import { Navigation } from 'react-router';

import graphUtils from '../../../../../utils/graphUtils';

export default React.createClass({
  mixins: [Navigation],

  propTypes: {
    model: React.PropTypes.object.isRequired,
    centerNodeId: React.PropTypes.string,
    showDisabled: React.PropTypes.bool.isRequired,
    disabledTransformation: React.PropTypes.bool.isRequired,
    showDisabledHandler: React.PropTypes.func.isRequired
  },

  _modelData() {
    const model = this.props.model.toJS();
    model.nodes = graphUtils.addLinksToNodes(model.nodes);
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
      'g.edgePath.alias': {
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
      '.node.transformation rect': {
        fill: '#363636'
      },
      '.node.remote-transformation rect': {
        fill: '#999999'
      },
      '.node.writer rect': {
        fill: '#faa732'
      },
      '.node.input rect': {
        fill: '#468847'
      },
      '.node.output rect': {
        fill: '#3a87ad'
      }
    };
    return this.graph.render(this.props.centerNodeId);
  },

  componentWillUnmount() {
    return window.removeEventListener('resize', this.handleResize);
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.graph = new GraphCanvas({}, this.refs.graph);
    return this._renderGraph();
  },

  componentDidUpdate() {
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

  _handleChangeShowDisabled(e) {
    const showDisabled = e.target.checked;
    return this.props.showDisabledHandler(showDisabled);
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
            <span
              className="pull-right checkbox"
              style={{
                marginTop: '5px'
              }}
            >
              {this.props.disabledTransformation ? (
                <small>Showing all disabled transformations</small>
              ) : (
                <label className="control-label">
                  <input
                    type="checkbox"
                    onChange={this._handleChangeShowDisabled}
                    checked={this.props.showDisabled}
                    ref="showDisabled"
                  />
                  {' Show disabled transformations'}
                </label>
              )}
            </span>
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
