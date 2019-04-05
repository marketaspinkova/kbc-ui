import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { Map } from 'immutable';
import { Label } from 'react-bootstrap';
import Select from 'react-select';
import graphUtils from '../../../utils/graphUtils';
import GraphCanvas from '../../common/GraphCanvas';

export default createReactClass({
  propTypes: {
    nodes: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
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
    const options = this.props.nodes
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
    this.graph.height = 600;
    this.graph.styles = graphUtils.styles();
    this.graph.render();
  },

  prepareData() {
    const highlightedMap = this.props.nodes
      .toMap()
      .mapKeys((index, node) => node.get('id').toString())
      .map((node) => Map({
        isOrigin: node.get('isOrigin', false),
        isHighlighted: node.get('isHighlighted', false)
      }));

    return {
      nodes: this.props.nodes
        .map((node) => ({
          node: node.get('id'),
          type: this.getNodeType(node),
          link: this.getNodeLink(node),
          label: node.get('title')
        }))
        .toArray(),
      transitions: this.props.links
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
    const target = nodes.get(link.get('target'), Map());
    const source = nodes.get(link.get('source'), Map());

    if (target.get('isOrigin', false) && source.get('isHighlighted', false)) {
      return 'highlighted';
    }

    if (target.get('isHighlighted', false) && source.get('isOrigin', false)) {
      return 'highlighted';
    }

    return 'data';
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
