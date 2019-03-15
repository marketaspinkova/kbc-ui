import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../../components/stores/StorageJobsStore';
import { jobsLimit } from '../../Constants';
import { loadJobs } from '../../Actions';
import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  getStateFromStores() {
    return {
      isLoading: JobsStore.getIsLoading()
    };
  },

  handleRefreshClick() {
    const params = {
      limit: jobsLimit
    };

    return loadJobs(params);
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this.handleRefreshClick} />;
  }
});
