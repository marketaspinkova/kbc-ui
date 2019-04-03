import { event, select, selectAll } from 'd3-selection';
import { drag } from 'd3-drag';
import dagreD3 from 'dagre-d3';
import _ from 'underscore';

function parseTransform(transform) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttributeNS(null, 'transform', transform);
  const matrix = g.transform.baseVal.consolidate().matrix;
  return { x: matrix.e, y: matrix.f };
}

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

    this.data.nodes.forEach((node) => {
      data.setNode(node.node, {
        class: node.type,
        labelType: 'html',
        label: `<a href="${node.link}">${node.label}</a>`,
        padding: 2,
        rx: 5,
        ry: 5
      });
    });

    this.data.transitions.forEach((transition) => {
      data.setEdge(transition.source, transition.target, {
        class: transition.type,
        type: transition.type,
        label: transition.label || ''
      });
    });

    return data;
  }

  createSvg(svg, data, centerNodeId) {
    svg.selectAll('*').remove();
    new dagreD3.render()(svg.append('g'), data);

    // apply styles
    _.each(this.styles, (styles, selector) =>
      _.each(styles, (value, property) => selectAll(selector).style(property, value))
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
    select(this.element).attr('width', this.getWidth());
  }

  adjustCanvasHeight() {
    select(this.element).attr('height', this.getHeight());
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
    select(this.element)
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
      const svg = select(this.element);
      this.createSvg(svg, data, centerNodeId);
      this.reset();

      // init position + dragging
      svg.call(
        drag()
          .subject(() => {
            const g = svg.select('g');
            const parsetData = parseTransform(g.attr('transform'));
            return {
              x: g.attr('x') + parsetData.x,
              y: g.attr('y') + parsetData.y
            };
          })
          .on('drag', () => {
            this.position.x = event.x;
            this.position.y = event.y;
            svg
              .select('g')
              .attr(
                'transform',
                () => `translate(${[event.x, event.y]}), scale(${this.zoom.scale})`
              );
          })
      );
    }

    return false;
  }
}

export default Graph;
