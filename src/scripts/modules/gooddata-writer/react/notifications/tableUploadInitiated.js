import React from 'react';
import { Link } from 'react-router';

export default (job, table) => {
  return React.createClass({
    propTypes: {
      onClick: React.PropTypes.func
    },
    render() {
      return (
        <span>
          GoodData upload of table <strong>{table.getIn(['data', 'title'])}</strong>{' '}
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
