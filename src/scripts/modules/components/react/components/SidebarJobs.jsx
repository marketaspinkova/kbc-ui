import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import JobRow from './SidebarJobsRow';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    jobs: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number
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
    let query = '';

    if (!params) {
      return null;
    }


    if (params.get('component')) {
      query += `+params.component:${this.props.componentId}`;
    } else {
      // legacy components
      query += `+component:${this.props.componentId}`;
    }

    query += ` +params.config:${this.props.configId}`;

    return (
      <div className="jobs-link" key="jobs-link">
        <Link
          to="jobs"
          query={{
            q: query
          }}
        >
          Show all jobs
        </Link>
      </div>
    );
  }
});
