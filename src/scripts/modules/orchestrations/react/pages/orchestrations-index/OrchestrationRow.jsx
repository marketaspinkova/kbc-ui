import React from 'react';
import DurationWithIcon from '../../../../../react/common/DurationWithIcon';
import { Finished } from '@keboola/indigo-ui';
import JobStatusCircle from '../../../../../react/common/JobStatusCircle';
import { Link } from 'react-router';
import OrchestrationActiveButton from '../../components/OrchestrationActiveButton';
import OrchestrationDeleteButton from '../../components/OrchestrationDeleteButton';
import OrchestrationRunButton from '../../components/OrchestrationRunButton';
import CronRecord from './../../components/CronRecord';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    orchestration: React.PropTypes.object,
    pendingActions: React.PropTypes.object
  },

  buttons() {
    const buttons = [];

    buttons.push(
      <OrchestrationDeleteButton
        orchestration={this.props.orchestration}
        isPending={this.props.pendingActions.get('delete', false)}
        key="delete"
      />
    );

    buttons.push(
      <OrchestrationActiveButton
        orchestration={this.props.orchestration}
        isPending={this.props.pendingActions.get('active', false)}
        key="activate"
      />
    );

    buttons.push(<OrchestrationRunButton orchestration={this.props.orchestration} notify={true} key="run" />);

    return buttons;
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
          <JobStatusCircle status={lastExecutedJob && lastExecutedJob.get('status')} />{' '}
          {this.props.orchestration.get('name')}
        </span>
        <span className="td">
          {lastExecutedJob &&
            lastExecutedJob.get('startTime') && (
            <Finished hasIcon={true} endTime={lastExecutedJob && lastExecutedJob.get('startTime')} />
          )}
        </span>
        <span className="td">{duration}</span>
        <span className="td">
          <CronRecord crontabRecord={this.props.orchestration.get('crontabRecord')} />
        </span>
        <span className="td text-right kbc-no-wrap">{this.buttons()}</span>
      </Link>
    );
  }
});
