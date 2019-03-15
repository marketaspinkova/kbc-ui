import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

export default (job) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func
    },
    render() {
      return (
        <span>
          Optimalization of SLI hashes has been triggered! You can track the job progres{' '}
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
