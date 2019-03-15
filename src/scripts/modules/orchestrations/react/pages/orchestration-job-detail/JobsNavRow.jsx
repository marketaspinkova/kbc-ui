import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Finished, JobStatusCircle } from '@keboola/indigo-ui';
import DurationWithIcon from '../../../../../react/common/DurationWithIcon';
import ImmutableRendererMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';

export default createReactClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    job: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired
  },

  render() {
    const className = this.props.isActive ? 'active' : '';

    return (
      <Link
        className={`list-group-item ${className}`}
        to="orchestrationJob"
        params={{
          orchestrationId: this.props.job.get('orchestrationId'),
          jobId: this.props.job.get('id')
        }}
      >
        <span className="table">
          <span className="tr">
            <span className="td kbc-td-status col-xs-1">
              <JobStatusCircle status={this.props.job.get('status')} />
            </span>
            <span className="td">
              {this.props.job.get('initializedBy') === 'manually' && (
                <em title={this.props.job.getIn(['initiatorToken', 'description'])}>manually</em>
              )}
              <strong>{this.props.job.getIn(['initiatorToken', 'description'])}</strong>
              <span>
                {this.props.job.get('startTime') && (
                  <DurationWithIcon
                    startTime={this.props.job.get('startTime')}
                    endTime={this.props.job.get('endTime')}
                  />
                )}
              </span>
              <span className="kb-info clearfix pull-right">
                <Finished showIcon endTime={this.props.job.get('endTime')} />
              </span>
            </span>
          </span>
        </span>
      </Link>
    );
  }
});
