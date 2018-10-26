import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/JobsStore';
import { Loader } from '@keboola/indigo-ui';
import RoutesStore from '../../../../stores/RoutesStore';

export default React.createClass({
  mixins: [createStoreMixin(JobsStore)],

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getStateFromStores() {
    return {
      job: JobsStore.get(this._getJobId()),
      jobLoading: JobsStore.getIsJobLoading(this._getJobId())
    };
  },

  render() {
    if (!this.state.job) {
      return null;
    }

    return (
      <span>
        {this.state.jobLoading && (
          <span>
            {' '}
            <Loader />
          </span>
        )}
      </span>
    );
  }
});
