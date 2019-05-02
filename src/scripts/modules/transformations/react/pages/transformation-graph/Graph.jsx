import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import GraphCanvas from '../../../../../react/common/GraphCanvas';

import graphUtils from '../../../../../utils/graphUtils';

export default createReactClass({
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

  componentDidMount() {
    this.graph = new GraphCanvas({}, this.refs.graph);
    this._renderGraph();
  },

  componentDidUpdate() {
    this._renderGraph();
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
