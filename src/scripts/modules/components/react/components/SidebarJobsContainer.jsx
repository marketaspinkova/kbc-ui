import PropTypes from 'prop-types';
import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import LatestJobsStore from '../../../jobs/stores/LatestJobsStore';
import SidebarJobs from './SidebarJobs';

export default React.createClass({
  mixins: [createStoreMixin(LatestJobsStore)],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string,
    limit: PropTypes.number
  },

  getStateFromStores() {
    if (this.props.componentId === 'transformation') {
      return {
        latestJobs: this.props.rowId
          ? LatestJobsStore.getTransformationJobs(this.props.configId, this.props.rowId)
          : LatestJobsStore.getJobs(this.props.componentId, this.props.configId),
      };
    }
    return {
      latestJobs: this.props.rowId
        ? LatestJobsStore.getRowJobs(this.props.componentId, this.props.configId, this.props.rowId)
        : LatestJobsStore.getJobs(this.props.componentId, this.props.configId),
    };
  },

  render() {
    return (
      <SidebarJobs
        jobs={this.state.latestJobs}
        componentId={this.props.componentId}
        configId={this.props.configId}
        rowId={this.props.rowId}
        limit={this.props.limit}
      />
    );
  }
});
