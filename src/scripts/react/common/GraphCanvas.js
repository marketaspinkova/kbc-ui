import d3 from 'd3';
import dagreD3 from 'dagre-d3';
import _ from 'underscore';

class Graph {
  constructor(data, wrapperElement) {
    this.getData = this.getData.bind(this);
    this.createSvg = this.createSvg.bind(this);
    this.adjustPositions = this.adjustPositions.bind(this);
    this.data = data;

    this.height = 300;
    this.zoom = { scale: 1, max: 1.75, min: 0.5, step: 0.25 };
    this.defaultZoom = { ...this.zoom };
    this.position = { x: 0, y: 0 };
    this.defaultPosition = { ...this.position };
    this.spacing = 2;
    this.styles = {};

    this.svgTemplate = '<svg width="0" height="0" id="svgGraph" class="kb-graph"></svg>';

    wrapperElement.innerHTML = this.svgTemplate;
    this.element = wrapperElement.childNodes[0];
  }

  getData() {
    const data = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'LR',
      nodesep: 10 * this.spacing,
      edgesep: 10 * this.spacing,
      ranksep: 20 * this.spacing
    });

    for (var i in this.data.nodes) {
      data.setNode(this.data.nodes[i].node, {
        labelType: 'html',
        label: `<a href="${this.data.nodes[i].link}">${this.data.nodes[i].label}</a>`,
        padding: 2,
        rx: 5,
        ry: 5
      });
    }

    this.data.transitions.forEach((transition) => {
      data.setEdge(transition.source, transition.target, {
        type: transition.type,
        label: transition.label || ''
      });
    });

    return data;
  }

  createSvg(svg, data, centerNodeId) {
    svg.selectAll('*').remove();
    new dagreD3.render()(svg.append('g'), data);

    // assign edge classes according to node types
    const transitionClassMap = [];
    _.each(_.uniq(_.pluck(this.data.transitions, 'type')), (type) => {
      transitionClassMap[type] = (edge) => data.edge(edge.v, edge.w).type === type;
    });
    d3.selectAll('g.edgePath').classed(transitionClassMap);

    // assign node classes according to node types
    const nodeClassMap = [];
    _.each(_.uniq(_.pluck(this.data.nodes, 'type')), (type) => {
      nodeClassMap[type] = (id) =>
        !!this.data.nodes.find((dataNode) => dataNode.node === id && dataNode.type === type);
    });
    d3.selectAll('g.node').classed(nodeClassMap);

    // apply styles
    _.each(this.styles, (styles, selector) =>
      _.each(styles, (value, property) => d3.selectAll(selector).style(property, value))
    );

    // center node
    if (centerNodeId && data._nodes[centerNodeId]) {
      this.defaultPosition.x = -data._nodes[centerNodeId].x + this.getWidth() / 2;
      this.defaultPosition.y = -data._nodes[centerNodeId].y + this.getHeight() / 2;
    }
  }

  zoomIn() {
    const prevZoomScale = this.zoom.scale;
    this.zoom.scale = Math.min(this.zoom.max, this.zoom.scale + this.zoom.step);
    this.adjustPositions(this.zoom.scale / prevZoomScale);
  }

  zoomOut() {
    const prevZoomScale = this.zoom.scale;
    this.zoom.scale = Math.max(this.zoom.min, this.zoom.scale - this.zoom.step);
    this.adjustPositions(this.zoom.scale / prevZoomScale);
  }

  adjustCanvasWidth() {
    d3.select(this.element).attr('width', this.getWidth());
  }

  adjustCanvasHeight() {
    d3.select(this.element).attr('height', this.getHeight());
  }

  adjustPositions(factor) {
    if (factor === 1) {
      return;
    }

    this.position.x = (this.position.x - this.getWidth() / 2) * factor + this.getWidth() / 2;
    this.position.y = (this.position.y - this.getHeight() / 2) * factor + this.getHeight() / 2;
    this.setTransform();
  }

  reset() {
    this.position.x = this.defaultPosition.x;
    this.position.y = this.defaultPosition.y;
    this.zoom.scale = this.defaultZoom.scale;
    this.setTransform();
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.element.parentNode.offsetWidth;
  }

  setTransform() {
    d3.select(this.element)
      .select('g')
      .attr(
        'transform',
        `translate(${[this.position.x, this.position.y]}), scale(${this.zoom.scale})`
      );
  }

  render(centerNodeId) {
    const data = this.getData();
    this.adjustCanvasWidth();
    this.adjustCanvasHeight();

    if (data) {
      const svg = d3.select(this.element);
      this.createSvg(svg, data, centerNodeId);
      this.reset();

      // init position + dragging
      svg.call(
        d3.behavior
          .drag()
          .origin(() => {
            const t = svg.select('g');
            return {
              x: t.attr('x') + d3.transform(t.attr('transform')).translate[0],
              y: t.attr('y') + d3.transform(t.attr('transform')).translate[1]
            };
          })
          .on('drag', () => {
            this.position.x = d3.event.x;
            this.position.y = d3.event.y;
            return svg
              .select('g')
              .attr(
                'transform',
                () => `translate(${[d3.event.x, d3.event.y]}), scale(${this.zoom.scale})`
              );
          })
      );
    }

    return false;
  }
}

export default Graph;
