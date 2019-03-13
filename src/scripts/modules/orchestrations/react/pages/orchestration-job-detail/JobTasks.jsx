import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import { Panel, PanelGroup, Alert } from 'react-bootstrap';
import ComponentConfigurationLink from '../../../../components/react/components/ComponentConfigurationLink';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import Duration from '../../../../../react/common/Duration';
import { Tree } from '@keboola/indigo-ui';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import date from '../../../../../utils/date';

export default React.createClass({
  propTypes: {
    tasks: PropTypes.object.isRequired
  },

  getInitialState() {
    return { components: ComponentsStore.getAll() };
  },

  render() {
    return (
      <PanelGroup accordion={true} className="kbc-panel-heading-with-table">
        {this._renderTasks()}
      </PanelGroup>
    );
  },

  _renderTasks() {
    return this.props.tasks
      .filter(task => task.get('active'))
      .map(this._renderTask)
      .toArray();
  },

  _renderTask(task) {
    const component = this.state.components.get(task.get('component'));

    const header = (
      <span>
        <span className="table">
          <span className="tbody">
            <span className="tr">
              <span className="td col-xs-6">
                {component ? (
                  <span>
                    <ComponentIcon size="32" component={component} /> <ComponentName component={component} />
                  </span>
                ) : (
                  task.get('componentUrl')
                )}{' '}
                {task.has('config') && ` - ${task.getIn(['config', 'name'])}`}
              </span>
              <span className="td col-xs-2 text-right">
                <span className="label kbc-label-rounded kbc-label-block label-default">{task.get('phase')}</span>
              </span>
              <span className="td col-xs-2 text-right">
                <Duration startTime={task.get('startTime')} endTime={task.get('endTime')} />
              </span>
              <span className="td col-xs-2 text-right">
                {task.get('status', false) && <JobStatusLabel status={task.get('status')} />}
              </span>
            </span>
          </span>
        </span>
      </span>
    );

    return (
      <Panel header={header} key={task.get('id')} eventKey={task.get('id')}>
        {task.get('startTime') && (
          <p>
            <strong>{'Start time '}</strong>
            {date.format(task.get('startTime'))}
          </p>
        )}
        {task.get('endTime') && (
          <p>
            <strong>{'End time '}</strong>
            {date.format(task.get('endTime'))}
          </p>
        )}
        {task.has('config') && (
          <p>
            <strong>{'Configuration '}</strong>
            <ComponentConfigurationLink componentId={task.get('component')} configId={task.getIn(['config', 'id'])}>
              {task.getIn(['config', 'name'])}
            </ComponentConfigurationLink>
          </p>
        )}
        {task.get('runParameters') &&
          task.get('runParameters').size && (
          <div>
            <p>
              <strong>Parameters</strong>
            </p>
            <Tree data={task.get('runParameters')} />
          </div>
        )}
        {task.getIn(['response', 'id']) && (
          <Link to="jobDetail" params={{ jobId: task.getIn(['response', 'id']) }}>
            Go to job detail
          </Link>
        )}
        {this.renderSpecificErrorMessage(task)}
      </Panel>
    );
  },

  renderSpecificErrorMessage(task) {
    const message = task.getIn(['response', 'message'], '');
    if (message === 'Orchestrations can be started only 2 times for current id.') {
      return (
        <Alert bsStyle="danger">
          Maximum orchestration nesting level (2) was exceeded.
        </Alert>
      );
    }
    return null;
  }
});
