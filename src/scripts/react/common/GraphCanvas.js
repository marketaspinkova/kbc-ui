import { event, select, selectAll } from 'd3-selection';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import dagreD3 from 'dagre-d3';
import _ from 'underscore';

class Graph {
  constructor(data, wrapperElement) {
    this.getGraph = this.getGraph.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.data = data;
    this.height = 300;
    this.styles = {};
    this.highlight = false;

    wrapperElement.innerHTML = '<svg width="0" height="0" id="svgGraph" class="kb-graph"></svg>';
    this.element = wrapperElement.childNodes[0];
  }

  getGraph() {
    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'LR'
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
    select(this.element).attr('height', this.height);
  }

  search(query) {
    const svg = select(this.element);
    svg.selectAll('.node, .edgePath').transition().duration(200).style('opacity', 1);
    svg.selectAll('.edgeLabel').transition().duration(200).style('opacity', 0);

    if (query) {
      svg.selectAll('.node').filter((node) => node !== query).transition().duration(200).style('opacity', 0.2);
      svg.selectAll('.edgePath').transition().duration(200).style('opacity', 0.2);
    }
  }

  handleHover() {
    if (!this.highlight) {
      return;
    }

    const svg = select(this.element);
    const nodesWithPath = svg.selectAll('.node, .edgePath');
    const nodes = svg.selectAll('.node');
    const paths = svg.selectAll('.edgePath');
    const labels = svg.selectAll('.edgeLabel');

    labels.style('opacity', 0);
    nodes
      .on('mouseover', (d) => {
        if (!event.ctrlKey) {
          const highlight = this.data.transitions.filter((path) => path.source === d).map(path => path.target);
          nodesWithPath.transition().duration(300).style('opacity', 0.2);
          nodes.filter((n) => n === d || highlight.includes(n)).transition().duration(300).style('opacity', 1);
          paths.filter((p) => p.v === d && highlight.includes(p.w)).transition().duration(300).style('opacity', 1);
          labels.filter((l) => l.v === d && highlight.includes(l.w)).transition().duration(300).style('opacity', 1);
        }
      })
      .on('mouseout', () => {
        if (!event.ctrlKey) {
          labels.transition().duration(300).style('opacity', 0);
          nodesWithPath.transition().duration(300).style('opacity', 1);
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
      const padding = 30;
      const bBox = inner.node().getBBox();
      const hRatio = this.height / (bBox.height + padding);
      const wRatio = svg.attr('width') / (bBox.width + padding);
      const initialScale = Math.min(1, hRatio < wRatio ? hRatio : wRatio);

      svg.attr('height', this.height + padding);
      svg.call(zoom);
      svg.call(zoom.transform, zoomIdentity
        .translate(
          (svg.attr('width') - bBox.width * initialScale) / 2,
          (svg.attr('height') - bBox.height * initialScale) / 2,
        )
        .scale(initialScale)
      );

      this.handleHover();
    }

    return null;
  }
}

export default Graph;
