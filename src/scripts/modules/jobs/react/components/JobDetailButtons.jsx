import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/JobsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import JobTerminateButton from './JobTerminateButton';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getStateFromStores() {
    const jobId = this._getJobId();
    return { job: JobsStore.get(jobId) };
  },

  render() {
    if (!this.state.job) {
      return null;
    }

    return (
      <span>
        <JobTerminateButton job={this.state.job} />
      </span>
    );
  }
});
