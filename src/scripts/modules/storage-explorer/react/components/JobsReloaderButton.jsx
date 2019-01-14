import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import StorageActionCreators from '../../../components/StorageActionCreators';
import JobsStore from '../../../components/stores/StorageJobsStore';
import { jobsLimit } from '../../Constants';
import { RefreshIcon } from '@keboola/indigo-ui';

export default React.createClass({
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

    return StorageActionCreators.loadJobs(params);
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this.handleRefreshClick} />;
  }
});
