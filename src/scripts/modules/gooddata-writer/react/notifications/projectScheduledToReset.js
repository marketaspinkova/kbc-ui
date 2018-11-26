import React from 'react';
import { Link } from 'react-router/lib';

export default (job) => {
  return React.createClass({
    propTypes: {
      onClick: React.PropTypes.func
    },
    render() {
      return (
        <span>
          Project has been scheduled to reset! You can track the job progress{' '}
          <Link
            to="jobDetail"
            params={{
              jobId: job.id
            }}
            onClick={this.props.onClick}
          >
            here
          </Link>
        </span>
      );
    }
  });
};