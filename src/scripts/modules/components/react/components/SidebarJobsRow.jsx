import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import { Finished, JobStatusCircle } from '@keboola/indigo-ui';
import DurationWithIcon from '../../../../react/common/DurationWithIcon';
import JobPartialRunLabel from '../../../../react/common/JobPartialRunLabel';

export default createReactClass({
  propTypes: {
    job: PropTypes.object.isRequired
  },

  render() {
    return (
      <Link
        className="list-group-item"
        to="jobDetail"
        params={{
          jobId: this.props.job.get('id')
        }}
      >
        <span className="table">
          <span className="tr">
            <span className="td kbc-td-status">
              <JobStatusCircle status={this.props.job.get('status')} />
            </span>
            <span className="td">
              <div>
                <JobPartialRunLabel job={this.props.job} />
                {this.props.job.getIn(['token', 'description'])}
              </div>
              <div>
                <small className="pull-left">
                  {this.props.job.get('startTime') && (
                    <DurationWithIcon
                      startTime={this.props.job.get('startTime')}
                      endTime={this.props.job.get('endTime')}
                    />
                  )}
                </small>
                <small className="pull-right">
                  <Finished endTime={this.props.job.get('endTime')} showIcon />
                </small>
              </div>
            </span>
          </span>
        </span>
      </Link>
    );
  }
});
