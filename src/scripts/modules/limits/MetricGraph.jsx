import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Keen from 'keen-js';
import { fromJS } from 'immutable';

function format(unit) {
  switch (unit) {
    case 'millions':
      return '#,### M';
    case 'bytes':
      return '#,### GB';
    default:
      return '#,###';
  }
}

function getConversion(unit) {
  switch (unit) {
    case 'millions':
      return val => Number((val / (1000 * 1000)).toFixed(2));
    case 'bytes':
      return val => Number((val / (1000 * 1000 * 1000)).toFixed(2));
    default:
      return val => val;
  }
}

function createChartOptions(options) {
  return fromJS({
    colors: [
      /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
      '#0bbcfa',
      '#fb4f61',
      '#eeb058',
      '#8a8ad6',
      '#ff855c',
      '#00cfbb',
      '#5a9eed',
      '#73d483',
      '#c879bb',
      '#0099b6',
      '#d74d58',
      '#cb9141',
      '#6b6bb6',
      '#d86945',
      '#00aa99',
      '#4281c9',
      '#57b566',
      '#ac5c9e',
      '#27cceb',
      '#ff818b',
      '#f6bf71',
      '#9b9be1',
      '#ff9b79',
      '#26dfcd',
      '#73aff4',
      '#87e096',
      '#d88bcb'
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
    chartArea: {
      left: 10,
      top: 10,
      width: options.elementWidth - 20,
      height: 0.5 * options.elementWidth - 20 - 10
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
    query: PropTypes.object.isRequired,
    limitValue: PropTypes.number,
    unit: PropTypes.string,
    client: PropTypes.object.isRequired
  },

  componentDidMount() {
    const el = this.refs.metric;
    const query = new Keen.Query('average', this.props.query);

    const chart = new Keen.Dataviz()
      .chartType('areachart')
      .width(el.offsetWidth)
      .height(0.5 * el.offsetWidth)
      .el(el)
      .prepare();

    const limitValue = this.props.limitValue;
    let unit = this.props.unit;
    let conversion = getConversion(this.props.unit);

    this.props.client.run([query], function() {
      chart.parseRequest(this).call(function() {
        // in case thand maximum number is less than 1M don't conver to millions
        if (unit === 'millions' && !limitValue) {
          const greater = this.data().filter(row => {
            return row[1] > 1000000;
          });
          if (greater.length === 0) {
            conversion = getConversion('number');
            unit = 'number';
          }
        }

        // graph throws error if all values are null - switch all nulls to zeros
        const nonNullValues = this.data().filter((row, i) => row[1] !== null && i !== 0);

        const converted = this.data()
          .map(row => [row[0], row[1] === null && nonNullValues.length === 0 ? 0 : row[1]])
          .map((row, i, data) => {
            const style = i === data.length - 1 ? 'point {visible: true; size: 5;}' : null;
            if (i === 0) {
              if (limitValue) {
                return ['Date', 'Value', { type: 'string', role: 'style' }, 'Limit'];
              }

              return ['Date', 'Value', { type: 'string', role: 'style' }];
            }

            if (limitValue) {
              return [row[0], row[1] === null ? null : conversion(row[1]), style, conversion(limitValue)];
            }

            return [row[0], row[1] === null ? null : conversion(row[1]), style];
          });

        const chartOptions = createChartOptions({
          elementWidth: el.offsetWidth,
          vAxisFormat: format(unit)
        });

        /* global google */
        const ds = new google.visualization.arrayToDataTable(converted);
        const combo = new google.visualization.ComboChart(this.el());
        combo.draw(ds, chartOptions.toJS());
      });
    });
  },

  render() {
    return <div ref="metric" />;
  }
});
