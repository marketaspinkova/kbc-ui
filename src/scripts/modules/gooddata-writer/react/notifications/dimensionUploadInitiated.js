import React from 'react';
import { Link } from 'react-router';

export default (job, dimensionName) => {
  return React.createClass({
    propTypes: {
      onClick: React.PropTypes.func
    },
    render() {
      return (
        <span>
          GoodData upload of dimension <strong>{dimensionName}</strong>{' '}
          has been initiated You can track the job progress{' '}
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
