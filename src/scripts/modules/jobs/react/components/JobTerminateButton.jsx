import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/JobsStore';
import ActionCreators from '../../ActionCreators';
import RoutesStore from '../../../../stores/RoutesStore';
import TerminateButton from '../../../../react/common/JobTerminateButton';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getStateFromStores() {
    const jobId = this._getJobId();

    return {
      job: JobsStore.get(jobId),
      isTerminating: JobsStore.getIsJobTerminating(jobId)
    };
  },

  handleTerminate() {
    return ActionCreators.terminateJob(this.state.job.get('id'));
  },

  render() {
    return (
      <TerminateButton
        job={this.state.job}
        isTerminating={this.state.isTerminating}
        onTerminate={this.handleTerminate}
      />
    );
  }
});
