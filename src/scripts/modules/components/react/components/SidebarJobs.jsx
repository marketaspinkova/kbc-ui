import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import JobRow from './SidebarJobsRow';
import { getQuery, getLegacyComponentQuery } from '../../../../utils/jobsQueryBuilder';

export default createReactClass({
  mixins: [PureRenderMixin],

  propTypes: {
    jobs: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string,
    limit: PropTypes.number
  },

  getDefaultProps() {
    return { limit: 5 };
  },

  renderJobs() {
    if (!this.props.jobs.get('jobs').count()) {
      return (
        <div>
          <small className="text-muted">No jobs found</small>
        </div>
      );
    }

    return this.props.jobs
      .get('jobs')
      .slice(0, this.props.limit)
      .map(job => <JobRow job={job} key={job.get('id')} />)
      .toArray()
      .concat(this.renderAllJobsLink());
  },

  render() {
    return (
      <div>
        <h4>
          {'Last runs '}
          {this.props.jobs.get('isLoading') && <Loader />}
        </h4>
        <div className="kbc-sidebar-jobs">{this.renderJobs()}</div>
      </div>
    );
  },

  renderAllJobsLink() {
    const jobs = this.props.jobs.get('jobs');
    const firstJob = jobs && jobs.first();
    const params = firstJob && firstJob.get('params');

    if (!params) {
      return null;
    }

    let queryFunction = getQuery;
    // legacy components
    if (!params.get('component')) {
      queryFunction = getLegacyComponentQuery;
    }

    return (
      <div className="jobs-link" key="jobs-link">
        <Link
          to="jobs"
          query={{
            q: queryFunction(this.props.componentId, this.props.configId, this.props.rowId)
          }}
        >
          Show all jobs
        </Link>
      </div>
    );
  }
});
