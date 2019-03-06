import React from 'react';
import DurationWithIcon from '../../../../../react/common/DurationWithIcon';
import { Finished, JobStatusCircle } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import OrchestrationActiveButton from '../../components/OrchestrationActiveButton';
import OrchestrationDeleteButton from '../../components/OrchestrationDeleteButton';
import OrchestrationRunButton from '../../components/OrchestrationRunButton';
import CronRecord from './../../components/CronRecord';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    orchestration: React.PropTypes.object,
    pendingActions: React.PropTypes.object,
    tasks: React.PropTypes.object
  },

  render() {
    let duration;
    const lastExecutedJob = this.props.orchestration.get('lastExecutedJob');
    if (lastExecutedJob && lastExecutedJob.get('startTime')) {
      duration = (
        <DurationWithIcon startTime={lastExecutedJob.get('startTime')} endTime={lastExecutedJob.get('endTime')} />
      );
    } else {
      duration = 'No run yet';
    }

    return (
      <Link className="tr" to="orchestration" params={{ orchestrationId: this.props.orchestration.get('id') }}>
        <span className="td">
          <JobStatusCircle status={lastExecutedJob && lastExecutedJob.get('status')} />
        </span>
        <span className="td">
          {this.props.orchestration.get('name')}
        </span>
        <span className="td">
          {lastExecutedJob &&
            lastExecutedJob.get('startTime') && (
            <Finished showIcon endTime={lastExecutedJob && lastExecutedJob.get('startTime')} />
          )}
        </span>
        <span className="td">{duration}</span>
        <span className="td">
          <CronRecord crontabRecord={this.props.orchestration.get('crontabRecord')} />
        </span>
        <span className="td text-right kbc-no-wrap">
          <OrchestrationDeleteButton
            orchestration={this.props.orchestration}
            isPending={this.props.pendingActions.get('delete', false)}
            tooltipPlacement="top"
          />
          <OrchestrationActiveButton
            orchestration={this.props.orchestration}
            isPending={this.props.pendingActions.get('active', false)}
          />
          <OrchestrationRunButton
            orchestration={this.props.orchestration}
            notify={true}
            tooltipPlacement="top"
            tasks={this.props.tasks}
          />
        </span>
      </Link>
    );
  }
});
