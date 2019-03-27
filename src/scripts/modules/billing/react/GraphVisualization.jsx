import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { fromJS } from 'immutable';

const chartOptions = {
  colors: [
    /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
    '#0bbcfa', '#fb4f61', '#eeb058', '#8a8ad6', '#ff855c', '#00cfbb', '#5a9eed', '#73d483', '#c879bb',
    '#0099b6', '#d74d58', '#cb9141', '#6b6bb6', '#d86945', '#00aa99', '#4281c9', '#57b566', '#ac5c9e',
    '#27cceb', '#ff818b', '#f6bf71', '#9b9be1', '#ff9b79', '#26dfcd', '#73aff4', '#87e096', '#d88bcb'
  ],
  legend: {
    position: 'none'
  },
  hAxis: {
    gridlines: {
      color: 'none'
    },
    textStyle: {
      color: '#98a2b5'
    },
    format: 'd.M.'
  },
  vAxis: {
    gridlines: {
      count: 4,
      color: '#e8e8ef'
    },
    baseline: 0,
    baselineColor: '#CCC',
    minValue: 0,
    textPosition: 'in',
    textStyle: {
      color: '#98a2b5'
    },
    viewWindow: {
      min: 0
    },
    format: '#.### credits'
  },
  lineWidth: 3,
  areaOpacity: 0.1,
  seriesType: 'area',
  series: {
    1: {
      type: 'line',
      lineWidth: 1
    }
  }
};

export default createReactClass({
  propTypes: {
    data: PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      data: fromJS([])
    };
  },

  componentDidMount() {
    this.drawGraph();
  },

  prepareGraphData() {
    if (this.props.data.isEmpty()) {
      return [];
    }

    const converted = [
      [
        'Date',
        'Value',
        {'type': 'string', 'role': 'style'}
      ]
    ];

    this.props.data.forEach((item) => {
      converted.push([
        new Date(item.get('date')),
        Number((item.get('value') / (10)).toFixed(3)),
        null
      ]);
    });

    return converted;
  },

  drawGraph() {
    const graphData = this.prepareGraphData();

    /* global google */
    const data = new google.visualization.arrayToDataTable(graphData);
    const formatter = new google.visualization.NumberFormat({ 
      suffix: ' credits',
      fractionDigits: 3,
      decimalSymbol: '.', 
      groupingSymbol: '' 
    });
    formatter.format(data, 1);
    const combo = new google.visualization.ComboChart(this.refs.lastMonthUsage);
    combo.draw(data, chartOptions);
  },

  render() {
    return (
      <div ref="lastMonthUsage"/>
    );
  }
});
