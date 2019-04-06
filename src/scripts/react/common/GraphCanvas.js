import { event, select, selectAll } from 'd3-selection';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import dagreD3 from 'dagre-d3';
import _ from 'underscore';

class Graph {
  constructor(data, wrapperElement) {
    this.getGraph = this.getGraph.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.data = data;
    this.minHeight = 300;
    this.spacing = 2;
    this.styles = {};
    this.highlight = false;

    wrapperElement.innerHTML = '<svg width="0" height="0" id="svgGraph" class="kb-graph"></svg>';
    this.element = wrapperElement.childNodes[0];
  }

  getGraph() {
    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'LR',
      nodesep: 10 * this.spacing,
      edgesep: 10 * this.spacing,
      ranksep: 20 * this.spacing
    });

    this.data.nodes.forEach((node) => {
      graph.setNode(node.node, {
        class: node.type,
        labelType: 'html',
        label: `<a href="${node.link}">${node.label}</a>`,
        padding: 2,
        rx: 5,
        ry: 5
      });
    });

    this.data.transitions.forEach((transition) => {
      graph.setEdge(transition.source, transition.target, {
        class: transition.type,
        type: transition.type,
        label: transition.label || ''
      });
    });

    return graph;
  }

  adjustCanvasWidth() {
    select(this.element).attr('width', this.element.parentNode.offsetWidth);
  }

  adjustCanvasHeight() {
    select(this.element).attr('height', this.minHeight);
  }

  search(query) {
    const svg = select(this.element);
    svg.selectAll('.node, .edgePath, .edgeLabel').transition().duration(200).style('opacity', 1);

    if (query) {
      svg.selectAll('.node').filter((node) => node !== query).transition().duration(200).style('opacity', 0.2);
      svg.selectAll('.edgePath, .edgeLabel').transition().duration(200).style('opacity', 0.2);
    }
  }

  handleHover() {
    if (!this.highlight) {
      return;
    }

    const svg = select(this.element);
    const all = svg.selectAll('.node, .edgePath, .edgeLabel');
    const nodes = svg.selectAll('.node');
    const others = svg.selectAll('.edgePath, .edgeLabel');
    nodes
      .on('mouseover', (d) => {
        if (!event.ctrlKey) {
          const highlight = [d].concat(this.data.transitions.filter((path) => path.source === d).map(path => path.target));
          all.transition().duration(200).style('opacity', 0.2);
          nodes.filter((node) => highlight.includes(node)).transition().duration(200).style('opacity', 1);
          others.filter((o) => highlight.includes(o.v) && highlight.includes(o.w)).transition().duration(200).style('opacity', 1);
        }
      })
      .on('mouseout', () => {
        if (!event.ctrlKey) {
          all.transition().duration(200).style('opacity', 1);
        }
      });
  }

  render() {
    const graph = this.getGraph();
    this.adjustCanvasWidth();
    this.adjustCanvasHeight();

    if (graph) {
      const svg = select(this.element);
      svg.selectAll('*').remove();

      new dagreD3.render()(svg.append('g'), graph);

      _.each(this.styles, (styles, selector) => {
        _.each(styles, (value, property) => selectAll(selector).style(property, value))
      });

      const inner = svg.select('g');
      const zoom = d3Zoom().on('zoom', () => inner.attr('transform', event.transform));
      svg.call(zoom);
      svg.call(zoom.transform, zoomIdentity
        .translate((svg.attr('width') - graph.graph().width * 0.75) / 2, 30)
        .scale(0.75)
      );
      svg.attr('height', Math.max(this.minHeight, graph.graph().height * 0.75 + 60));

      this.handleHover();
    }

    return null;
  }
}

export default Graph;
