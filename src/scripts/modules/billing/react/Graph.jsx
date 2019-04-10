import React  from 'react';
import createReactClass from 'create-react-class';
import GraphLegend from './GraphLegend';
import GraphVisualization from './GraphVisualization';
import moment from 'moment';
import {fromJS, Map} from 'immutable';
import MetricsApi from '../MetricsApi';
import {componentIoSummary} from './Index';
import Loader from './Loader';
import Keen from 'keen-js';

function getDatesForLastMonth() {
  const dateTo = moment().subtract(1, 'day');
  const dateFrom = moment().subtract(1, 'day').subtract(1, 'month');

  return {
    dateFrom: dateFrom.format('YYYY-MM-DD'),
    dateTo: dateTo.format('YYYY-MM-DD')
  };
}

export default createReactClass({

  getInitialState: function() {
    return {
      metricsData: fromJS([]),
      dates: getDatesForLastMonth(),
      showLoader: true
    };
  },

  componentDidMount: function() {
    Keen.ready(() => {
      this.loadMetricsData()
        .then((response) => {
          this.setState({
            metricsData: fromJS(response).map((item) => {
              return Map({
                date: item.get('dateFrom'), // same as dateTo
                value: componentIoSummary(item.get('components'), 'storage')
              });
            }),
            showLoader: false
          });
        });
    });
  },

  loadMetricsData: function() {
    return MetricsApi.getProjectMetrics(this.state.dates.dateFrom, this.state.dates.dateTo, 'day');
  },

  render() {
    if (this.state.showLoader) {
      return (
        <Loader />
      );
    } else {
      return (
        <div>
          <h3>
            {'Project Power for last month '}
            <small>
              {'from '}
              {moment(this.state.dates.dateFrom).format('MMM D, YYYY')}
              {' to '}
              {moment(this.state.dates.dateTo).format('MMM D, YYYY')}
            </small>
          </h3>
          <GraphVisualization data={this.state.metricsData}/>
          <GraphLegend
            value={this.state.metricsData.reduce(function(monthSummary, day) {
              return monthSummary + day.get('value');
            }, 0)}
          />
        </div>
      );
    }
  }

});
