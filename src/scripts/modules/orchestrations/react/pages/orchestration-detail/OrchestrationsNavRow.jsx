import React from 'react';
import { Link } from 'react-router';
import ImmutableRendererMixin from 'react-immutable-render-mixin';
import DurationWithIcon from '../../../../../react/common/DurationWithIcon';
import FinishedWithIcon from '../../../../../react/common/FinishedWithIcon';
import JobStatusCircle from '../../../../../react/common/JobStatusCircle';

export default React.createClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    orchestration: React.PropTypes.object,
    isActive: React.PropTypes.bool
  },

  render() {
    const className = this.props.isActive ? 'active' : '';
    const lastExecutedJob = this.props.orchestration.get('lastExecutedJob');

    return (
      <Link
        className={`list-group-item ${className}`}
        to="orchestration"
        params={{
          orchestrationId: this.props.orchestration.get('id')
        }}
      >
        <span className="table">
          <span className="tr">
            <span className="td kbc-td-status col-xs-1">
              <JobStatusCircle status={lastExecutedJob && lastExecutedJob.get('status')} />
            </span>
            <span className="td">
              <em>
                {!this.props.orchestration.get('active') && <span className="pull-right kb-disabled">Disabled</span>}
              </em>
              <strong>{this.props.orchestration.get('name')}</strong>
              <span>
                {lastExecutedJob &&
                  lastExecutedJob.get('startTime') && (
                  <DurationWithIcon
                    startTime={lastExecutedJob.get('startTime')}
                    endTime={lastExecutedJob.get('endTime')}
                  />
                )}
              </span>
              <span className="kb-info clearfix pull-right">
                {lastExecutedJob &&
                  lastExecutedJob.get('endTime') && <FinishedWithIcon endTime={lastExecutedJob.get('endTime')} />}
              </span>
            </span>
          </span>
        </span>
      </Link>
    );
  }
});
