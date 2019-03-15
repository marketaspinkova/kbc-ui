import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import later from 'later';

import StorageApi from '../../../../components/StorageApi';
import JobStats from './JobStats';


export default createReactClass({
  propTypes: {
    runId: PropTypes.string.isRequired,
    autoRefresh: PropTypes.bool.isRequired,
    jobMetrics: PropTypes.object.isRequired
  },

  mixins: [PureRenderMixin],

  componentDidMount() {
    this.collectStats(this.props.runId);
    if (this.props.autoRefresh) {
      this.startPolling();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.autoRefresh) {
      /* jslint browser:true */
      setTimeout(this.stopPolling, 2000); // events can be delayed
      this.collectStats(nextProps.runId);
    }

    if (nextProps.runId !== this.props.runId) {
      this.setState({
        stats: null
      });
      this.collectStats(nextProps.runId);
    }
  },

  componentWillUnmount() {
    this.stopPolling();
  },

  startPolling() {
    const schedule = later.parse.recur().every(5).second();
    this.stopPolling();
    this.timeout = later.setInterval(() => this.collectStats(this.props.runId), schedule);
  },

  stopPolling() {
    if (this.timeout) {
      this.timeout.clear();
    }
    if (this.cancellablePromise) {
      this.cancellablePromise.cancel();
    }
  },

  collectStats(runId) {
    this.setState({
      isLoading: true
    });
    this.cancellablePromise = StorageApi.getRunIdStats(runId)
      .then(this.receiveStats);
  },

  receiveStats(stats) {
    this.setState({
      stats: Immutable.fromJS(stats),
      isLoading: false
    });
  },

  getInitialState() {
    return {
      stats: null,
      isLoading: false
    };
  },

  render() {
    if (this.state.stats) {
      return (
        <JobStats
          stats={this.state.stats}
          isLoading={this.state.isLoading}
          jobMetrics={this.props.jobMetrics}
        />
      );
    } else {
      return (
        <div>
          Loading ...
        </div>
      );
    }
  }
});
