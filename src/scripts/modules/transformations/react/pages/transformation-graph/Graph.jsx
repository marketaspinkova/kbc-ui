import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import GraphCanvas from '../../../../../react/common/GraphCanvas';
import { Button } from 'react-bootstrap';
import { Navigation } from 'react-router';

import graphUtils from '../../../../../utils/graphUtils';

export default createReactClass({
  mixins: [Navigation],

  propTypes: {
    model: PropTypes.object.isRequired,
    centerNodeId: PropTypes.string,
    showDisabled: PropTypes.bool.isRequired,
    disabledTransformation: PropTypes.bool.isRequired,
    showDisabledHandler: PropTypes.func.isRequired
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
    this.graph.styles = graphUtils.styles();
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
