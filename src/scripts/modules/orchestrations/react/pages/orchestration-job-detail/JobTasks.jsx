import React from 'react';

import ComponentsStore from '../../../../components/stores/ComponentsStore';
import { Panel, PanelGroup } from 'react-bootstrap';
import ComponentConfigurationLink from '../../../../components/react/components/ComponentConfigurationLink';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import Duration from '../../../../../react/common/Duration';
import { Tree } from '@keboola/indigo-ui';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import date from '../../../../../utils/date';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired
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
                {task.has('status') && <JobStatusLabel status={task.get('status')} />}
              </span>
            </span>
          </span>
        </span>
      </span>
    );

    return (
      <Panel header={header} key={task.get('id')} eventKey={task.get('id')}>
        {task.get('startTime') && <div className="pull-right">{date.format(task.get('startTime'))}</div>}
        {task.has('config') && (
          <div>
            <strong>{'Configuration '}</strong>
            <ComponentConfigurationLink componentId={task.get('component')} configId={task.getIn(['config', 'id'])}>
              {task.getIn(['config', 'name'])}
            </ComponentConfigurationLink>
          </div>
        )}
        {task.get('runUrl') && (
          <div>
            <strong>POST</strong> {task.get('runUrl')}
          </div>
        )}
        {task.get('runParameters') &&
          task.get('runParameters').size && (
          <div>
            <h5>Parameters</h5>
            <Tree data={task.get('runParameters')} />
          </div>
        )}
        {task.get('response') &&
          task.get('response').size && (
          <div>
            <h5>Response</h5>
            <Tree data={task.get('response')} />
          </div>
        )}
      </Panel>
    );
  }
});