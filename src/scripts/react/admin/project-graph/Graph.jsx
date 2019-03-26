import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { List } from 'immutable';
import graphUtils from '../../../utils/graphUtils';
import GraphCanvas from '../../common/GraphCanvas';

export default createReactClass({
  propTypes: {
    data: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.initGraph();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  render() {
    return (
      <div className="graph">
        <div ref="graph" onWheel={this.handleMouseWheel} />
        {this.renderNone()}
      </div>
    );
  },

  renderNone() {
    return <p>A note about why some project are highlighted.</p>;
  },

  initGraph() {
    this.graph = new GraphCanvas(this.prepareData(), this.refs.graph);
    this.graph.zoom = { scale: 0.70, max: 1.70, min: 0.20, step: 0.1 };
    this.graph.styles = graphUtils.styles();
    this.graph.render(this.props.data.get('origin'));
  },

  prepareData() {
    const highlightedMap = this.props.data
      .get('nodes', List())
      .toMap()
      .mapKeys((index, node) => node.get('id').toString())
      .map((node) => node.get('isHighlighted', false));

    return {
      nodes: this.props.data
        .get('nodes', List())
        .map((node) => ({
          node: node.get('id'),
          type: this.getNodeType(node),
          link: this.getNodeLink(node),
          label: node.get('title')
        }))
        .toArray(),
      transitions: this.props.data
        .get('links', List())
        .map((link) => ({
          source: link.get('source'),
          target: link.get('target'),
          label: `${link.get('sourceBucket')} | ${link.get('targetBucket')}`,
          type: this.getLinkType(link, highlightedMap)
        }))
        .toArray()
    };
  },

  getNodeType(node) {
    if (node.get('isOrigin')) {
      return 'origin-project';
    }

    return node.get('isHighlighted') ? 'highlighted-project' : 'project';
  },

  getLinkType(link, nodes) {
    return nodes.get(link.get('source'), false) && nodes.get(link.get('target'), false)
      ? 'highlighted'
      : 'data';
  },

  getNodeLink(node) {
    return _.template(this.props.urlTemplates.get('project'))({
      projectId: node.get('id')
    });
  },

  handleMouseWheel(e) {
    e.preventDefault();

    if (e.deltaY < 0) {
      this.graph.zoomIn();
    } else {
      this.graph.zoomOut();
    }
  },

  handleResize() {
    this.graph.adjustCanvasWidth();
  }
});
