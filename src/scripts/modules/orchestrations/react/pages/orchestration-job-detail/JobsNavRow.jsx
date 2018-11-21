import React from 'react';
import JobStatusCircle from '../../../../../react/common/JobStatusCircle';
import FinishedWithIcon from '../../../../../react/common/FinishedWithIcon';
import { Duration } from '@keboola/indigo-ui';
import ImmutableRendererMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';

export default React.createClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    job: React.PropTypes.object.isRequired,
    isActive: React.PropTypes.bool.isRequired
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
                  <Duration
                    startTime={this.props.job.get('startTime')}
                    endTime={this.props.job.get('endTime')}
                    hasIcon
                  />
                )}
              </span>
              <span className="kb-info clearfix pull-right">
                <FinishedWithIcon endTime={this.props.job.get('endTime')} />
              </span>
            </span>
          </span>
        </span>
      </Link>
    );
  }
});
