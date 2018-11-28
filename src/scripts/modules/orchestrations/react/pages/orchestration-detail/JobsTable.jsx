import React from 'react';
import JobsTableRow from './JobsTableRow';
import { RefreshIcon } from '@keboola/indigo-ui';
import ImmutableRendererMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    jobs: React.PropTypes.object.isRequired,
    jobsLoading: React.PropTypes.bool.isRequired,
    onJobsReload: React.PropTypes.func.isRequired
  },

  render() {
    let rows;
    if (this.props.jobs.count()) {
      rows = this.props.jobs
        .map(job => <JobsTableRow job={job} key={job.get('id')} />)
        .toArray();
    } else {
      rows = (
        <tr>
          <td className="text-muted" colSpan={7}>
            The orchestration has not been executed yet.
          </td>
        </tr>
      );
    }

    return (
      <div>
        <div className="kbc-inner-padding">
          <span className="pull-right">
            <RefreshIcon isLoading={this.props.jobsLoading} onClick={this.props.onJobsReload}/>
          </span>
          <h2 style={{margin: '0px'}}>Last Runs</h2>
        </div>
        <table className="table table-striped table-hover kb-table-jobs kbc-cursor-pointer">
          <thead>
            <tr>
              <th>Created By</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
});
