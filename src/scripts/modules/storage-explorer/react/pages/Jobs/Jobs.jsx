import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Button } from 'react-bootstrap';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import JobsStore from '../../../../components/stores/StorageJobsStore';
import JobsTable from '../../components/JobsTable';
import { jobsLimit } from '../../../Constants';
import { loadMoreJobs } from '../../../Actions';
import NavButtons from '../../components/NavButtons';

export default createReactClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(JobsStore)],

  getStateFromStores() {
    return {
      jobs: JobsStore.getAll(),
      hasMore: JobsStore.hasMore(),
      isLoadingMore: JobsStore.getIsLoadingMore()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="storage-explorer">
            <NavButtons />
            {this.state.jobs.count() === 0 ? (
              <p className="kbc-inner-padding">No jobs have been uploaded yet.</p>
            ) : (
              <div>
                <JobsTable jobs={this.state.jobs} />
                {this.renderMoreButton()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },

  renderMoreButton() {
    if (!this.state.jobs.count() || !this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding">
        <Button onClick={this.fetchMoreJobs} disabled={this.state.isLoadingMore}>
          {this.state.isLoadingMore ? 'Loading ...' : 'Load more'}
        </Button>
      </div>
    );
  },

  getParams(offset) {
    const params = {
      limit: jobsLimit,
      offset
    };

    return params;
  },

  fetchMoreJobs() {
    const offset = this.state.jobs.count();
    return loadMoreJobs(this.getParams(offset));
  }
});
