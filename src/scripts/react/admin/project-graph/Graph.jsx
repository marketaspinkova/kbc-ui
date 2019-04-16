import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { List } from 'immutable';
import { Label } from 'react-bootstrap';
import Select from 'react-select';
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

  getInitialState() {
    return {
      searched: ''
    }
  },

  render() {
    return (
      <div className="graph">
        {this.renderSearch()}
        <div ref="graph" />
        {this.renderNone()}
        {this.renderLegend()}
      </div>
    );
  },

  renderSearch() {
    const options = this.props.data
      .get('nodes')
      .map((node) => ({
        value: node.get('id'),
        label: node.get('title')
      }))
      .sort((node) => node.label.toLowerCase())
      .toArray();

    return (
      <div className="graph-search">
        <Select
          value={this.state.searched}
          onChange={(selected) => {
            const value = selected ? selected.value : '';
            this.setState({ searched: value })
            this.graph.search(value)
          }}
          options={options}
          placeholder="Search project..."
          noResultsText="No project found"
        />
      </div>
    );
  },

  renderNone() {
    return <p className="pull-left">A note about why some project are highlighted.</p>;
  },

  renderLegend() {
    return (
      <div className="pull-right">
        <Label className="project-label">Project</Label>
        <Label className="highlighted-label">Highlighted project</Label>
        <Label className="origin-label">Current project</Label>
      </div>
    );
  },

  initGraph() {
    this.graph = new GraphCanvas(this.prepareData(), this.refs.graph);
    this.graph.highlight = true;
    this.graph.height = 500;
    this.graph.styles = graphUtils.styles();
    this.graph.render();
  },

  prepareData() {
    const highlightedMap = this.props.data
      .get('nodes', List())
      .toMap()
      .mapKeys((index, node) => node.get('id').toString())
      .map((node) => node.get('isHighlighted', false) || node.get('isOrigin', false));

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

  handleResize() {
    this.graph.adjustCanvasWidth();
  }
});
