import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import numeral from 'numeral';
import date from '../../../../utils/date';
import dimple from '../../../../utils/dimple';

export default createReactClass({
  propTypes: {
    data: PropTypes.object.isRequired
  },

  componentDidMount() {
    const svg = dimple.newSvg(this.refs.graph, '100%', 360);
    const chart = new dimple.chart(svg, this.prepareData());

    const xAxis = chart.addTimeAxis('x', 'date', null, '%Y-%m-%d');
    xAxis.title = '';

    const yAxis = chart.addMeasureAxis('y', 'duration');
    yAxis.title = 'Duration (seconds)';

    const series = chart.addSeries(null, dimple.plot.line);
    series.getTooltipText = e => [
      `Created: ${date.format(e.xField[0])}`,
      `Duration:  ${numeral(e.yValueList[0]).format('0.0')} Seconds`
    ];

    chart.setMargins(50, 50, 50, 100);
    chart.draw(200);

    this.chart = chart;

    window.addEventListener('resize', this.refreshGraph);
  },

  componentDidUpdate() {
    this.refreshGraph();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.refreshGraph);
  },

  refreshGraph() {
    this.chart.data = this.prepareData();
    this.chart.draw(200);
  },

  prepareData() {
    return this.props.data
      .map(event => ({
        duration: event.getIn(['performance', 'importDuration']),
        date: event.get('created')
      }))
      .toArray();
  },

  render() {
    return <div ref="graph" />;
  }
});
