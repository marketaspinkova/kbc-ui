import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/OrchestrationJobsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import JobTerminateButton from './JobTerminateButton';
import JobRetryButton from './JobRetryButton';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getStateFromStores() {
    const jobId = this._getJobId();

    return {
      job: JobsStore.getJob(jobId),
      isSaving: JobsStore.getIsJobRetrying(jobId)
    };
  },

  render() {
    return (
      <span>
        <JobRetryButton job={this.state.job} notify={true} isSaving={this.state.isSaving} />
        <JobTerminateButton job={this.state.job} />
      </span>
    );
  }
});
