import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

export default (job) => {
  return React.createClass({
    propTypes: {
      onClick: PropTypes.func
    },
    render() {
      return (
        <span>
          Table reset has been initiated. You can track the job progress{' '}
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
