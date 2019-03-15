import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {fromJS} from 'immutable';

function format(unit) {
  switch (unit) {
    case 'credits':
      return '#,### credits';
    default:
      return '#,###';
  }
}

function getConversion(unit) {
  switch (unit) {
    case 'credits':
      return function(val) {
        return Number((val / (1000 * 1000 * 1000)).toFixed(3));
      };
    default:
      return function(val) {
        return val;
      };
  }
}

function createChartOptions(options) {
  return fromJS({
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
      format: options.vAxisFormat
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
  });
}

export default createReactClass({

  propTypes: {
    data: PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      data: fromJS([])
    };
  },

  componentDidMount: function() {
    this.drawGraph();
  },

  prepareGraphData() {
    if (!this.props.data.isEmpty()) {
      let conversion = getConversion('credits');
      let converted = [
        [
          'Date',
          'Value',
          {'type': 'string', 'role': 'style'}
        ]
      ];

      this.props.data.forEach(function(item) {
        converted.push([
          new Date(item.get('date')),
          conversion(item.get('value')),
          null
        ]);
      });

      return converted;
    } else {
      return [];
    }
  },

  drawGraph() {
    const chartOptions = createChartOptions({
      vAxisFormat: format('credits')
    });
    const graphData = this.prepareGraphData();

    /* global google */
    const ds = new google.visualization.arrayToDataTable(graphData);
    const combo = new google.visualization.ComboChart(this.refs.lastMonthUsage);
    combo.draw(ds, chartOptions.toJS());
  },

  render: function() {
    return (
      <div ref="lastMonthUsage"/>
    );
  }

});
