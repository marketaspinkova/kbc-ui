import React from 'react';
import JobsNavRow from './JobsNavRow';

export default React.createClass({
  propTypes: {
    activeJobId: React.PropTypes.number.isRequired,
    jobs: React.PropTypes.object.isRequired
  },

  render() {
    const rows = this.props.jobs
      .map(job => {
        return <JobsNavRow job={job} isActive={this.props.activeJobId === job.get('id')} key={job.get('id')} />;
      })
      .toArray();

    return <div className="kb-orchestrations-nav list-group">{rows}</div>;
  }
});
