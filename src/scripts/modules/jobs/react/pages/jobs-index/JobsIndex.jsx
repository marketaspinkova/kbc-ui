import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import JobsStore from '../../../stores/JobsStore';
import ActionCreators from '../../../ActionCreators';
import QueryRow from './QueryRow';
import JobRow from './JobRow';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  getStateFromStores() {
    return {
      jobs: JobsStore.getAll(),
      isLoadMore: JobsStore.getIsLoadMore(),
      query: JobsStore.getQuery()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <QueryRow onSearch={this.handleSearch} query={this.state.query} />
          {this.renderTable()}
          {this.state.isLoadMore && (
            <div className="kbc-block-with-padding">
              <Button bsSize="large" onClick={this.handleLoadMore} className="text-center">
                More...
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },

  renderTable() {
    return (
      <div className="table table-striped table-hover">
        {this.renderTableHeader()}
        <div className="tbody">
          {this.state.jobs.map(this.renderJob).toArray()}
        </div>
      </div>
    );
  },

  renderTableHeader() {
    return (
      <div className="thead">
        <div className="tr">
          <span className="th">
            <strong>Component</strong>
          </span>
          <span className="th">
            <strong>Configuration</strong>
          </span>
          <span className="th">
            <strong>Created By</strong>
          </span>
          <span className="th">
            <strong>Created At</strong>
          </span>
          <span className="th">
            <strong>Status</strong>
          </span>
          <span className="th">
            <strong>Duration</strong>
          </span>
        </div>
      </div>
    );
  },

  renderJob(job) {
    const userRunnedJob = JobsStore.getUserRunnedParentJob(job);

    return (
      <JobRow 
        key={job.get('id')} 
        job={job}
        userRunnedJob={userRunnedJob}
        query={this.state.query} 
      />
    );
  },

  handleSearch(query) {
    return ActionCreators.filterJobs(query);
  },

  handleLoadMore() {
    return ActionCreators.loadMoreJobs();
  }
});
