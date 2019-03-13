import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import numeral from 'numeral';
import { Map } from 'immutable';
import date from '../../../../../utils/date';
import dimple from '../../../../../utils/dimple';

export default React.createClass({
  propTypes: {
    jobs: PropTypes.object.isRequired
  },

  componentDidMount() {
    const width = ReactDOM.findDOMNode(this).offsetWidth;
    const svg = dimple.newSvg(ReactDOM.findDOMNode(this), width, 0.35 * width);

    const data = this._prepareData();

    const chart = new dimple.chart(svg, data.get('jobs').toJS());
    chart.addTimeAxis('x', 'date', null, '%b %d');
    const yAxis = chart.addMeasureAxis('y', 'duration');
    yAxis.title = `Duration (${data.get('unit')})`;
    const s = chart.addSeries(['unit', 'status'], dimple.plot.bar);
    s.getTooltipText = e => [
      `Created: ${date.format(e.xField[0])}`,
      `Duration:  ${numeral(e.yValueList[0]).format('0.0')} ${e.aggField[0]}`
    ];
    chart.assignColor('error', 'red');
    chart.assignColor('success', '#96d130');
    chart.assignColor('warn', 'red');
    chart.assignColor('terminated', 'black');
    chart.draw();
    this.chart = chart;

    window.addEventListener('resize', this._refreshGraph);
  },

  componentDidUpdate() {
    this._refreshGraph();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._refreshGraph);
  },

  _refreshGraph() {
    const width = ReactDOM.findDOMNode(this).offsetWidth;
    const data = this._prepareData();
    this.chart.axes[1].title = `Duration (${data.get('unit')})`;
    this.chart.data = data.get('jobs').toJS();
    this.chart.svg.style('width', width);
    this.chart.setMargins('50px', '10px', '10px', '40px');
    this.chart.draw(200);
  },

  _prepareData() {
    let scale, unit;
    const jobs = this.props.jobs.map(job =>
      Map({
        status: job.get('status'),
        duration: (new Date(job.get('endTime')).getTime() - new Date(job.get('startTime')).getTime()) / 1000,
        date: parseInt(moment(job.get('createdTime')).format('x'), 10)
      })
    );

    const maxDuration = jobs.maxBy(job => job.get('duration')).get('duration');
    if (maxDuration < 60) {
      scale = 1;
      unit = 'Seconds';
    } else if (maxDuration < 3600) {
      scale = 60;
      unit = 'Minutes';
    } else {
      scale = 3600;
      unit = 'Hours';
    }

    return Map({
      scale,
      unit,
      jobs: jobs.map(job =>
        job.withMutations(item => {
          item.set('duration', item.get('duration') / scale);
          item.set('unit', unit);
        })
      )
    });
  },

  render() {
    return <div />;
  }
});
