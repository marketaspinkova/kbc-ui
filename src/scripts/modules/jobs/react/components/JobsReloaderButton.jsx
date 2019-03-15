import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/JobsStore';
import { RefreshIcon } from '@keboola/indigo-ui';
import ActionCreators from '../../ActionCreators';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  getStateFromStores() {
    return { jobsLoading: JobsStore.getIsLoading() };
  },

  handleRefreshClick() {
    return ActionCreators.reloadJobs();
  },

  render() {
    return <RefreshIcon isLoading={this.state.jobsLoading} onClick={this.handleRefreshClick} />;
  }
});
