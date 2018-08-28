import React from 'react';
import ReactDOM from 'react-dom';
import dimple from 'dimple/dist/dimple.v2.1.1.js';
import filesize from 'filesize';

const WIDTH = 140;

export default React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },

  getData() {
    if (this.props.data.count() <= 1) {
      return [];
    } else {
      return this.props.data.toJS();
    }
  },

  componentDidMount() {
    const svg = dimple.newSvg(ReactDOM.findDOMNode(this), WIDTH, WIDTH);
    svg.style('overflow', 'visible');
    const chart = new dimple.chart(svg, this.getData());
    chart.addMeasureAxis('p', 'Size');
    const ring = chart.addSeries('Tag', dimple.plot.pie);
    ring.innerRadius = '50%';
    ring.getTooltipText = (e) => {
      return [
        `Tag: ${e.aggField[0]}`,
        `Size: ${filesize(e.pValueList[0])}`
      ];
    };
    chart.draw();
    this.chart = chart;
  },

  componentDidUpdate() {
    this.refreshGraph();
  },

  refreshGraph() {
    this.chart.data = this.getData();
    this.chart.svg.style('width', WIDTH);
    this.chart.draw();
  },

  render() {
    return (
      <div/>
    );
  }

});
