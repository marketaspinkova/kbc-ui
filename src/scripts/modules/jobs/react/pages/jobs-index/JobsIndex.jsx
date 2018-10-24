import React from 'react';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import JobsStore from '../../../stores/JobsStore';
import ActionCreators from '../../../ActionCreators';
import QueryRow from './QueryRow';
import JobRow from './JobRow';
import Link from 'react-router/lib/components/Link';

export default React.createClass({
  mixins: [createStoreMixin(JobsStore)],

  getStateFromStores() {
    return {
      jobs: JobsStore.getAll(),
      isLoadMore: JobsStore.getIsLoadMore(),
      query: JobsStore.getQuery()
    };
  },

  _search(query) {
    return ActionCreators.filterJobs(query);
  },

  _loadMore() {
    return ActionCreators.loadMoreJobs();
  },

  render() {
    const links = [
      <Link to="jobs" query={{q: 'token.description%3Ajan%40keboola.com'}}>My jobs</Link>,
      <Link to="jobs" query={{q: 'status%3Aerror%20AND%20token.description%3Ajan%40keboola.com'}}>My failed jobs</Link>,
      <Link to="jobs" query={{q: 'durationSeconds%3A>7200'}}>All long running jobs</Link>,
      <Link to="jobs" query={{q: '%2Bparams.component%3Akeboola.ex-aws-s3%20%2Bparams.config%3A408135336'}}>Show all
        jobs</Link>
    ];
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <QueryRow
            onSearch={this._search}
            query={this.state.query}
            recommendedSearches={links}/>
          {this._renderTable()}
          {this.state.isLoadMore && (
            <div className="kbc-block-with-padding">
              <button onClick={this._loadMore} className="btn btn-default btn-large text-center">
                More..
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },

  _renderTableHeader() {
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

  _renderTable() {
    return (
      <div className="table table-striped table-hover">
        {this._renderTableHeader()}
        <div className="tbody">
          {this.state.jobs
            .map(job => {
              return <JobRow job={job} key={job.get('id')} query={this.state.query} />;
            })
            .toArray()}
        </div>
      </div>
    );
  }
});
