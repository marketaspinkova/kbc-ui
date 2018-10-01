import React from 'react';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import ComponentName from '../../../../../react/common/ComponentName';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    tasksCount: React.PropTypes.number
  },

  getDefaultProps() {
    return { tasksCount: 3 };
  },

  getInitialState() {
    return { components: ComponentsStore.getAll() };
  },

  render() {
    const hasMoreTasks = this.props.tasks.size > this.props.tasksCount;

    return (
      <span>
        {this.props.tasks.size === 0 ? (
          'Orchestration has no assigned tasks'
        ) : (
          <span>
            {this.props.tasks
              .take(this.props.tasksCount)
              .map((task, index, tasks) => {
                return (
                  <span key={task.get('id')}>
                    {this.state.components.get(task.get('component')) ? (
                      <ComponentName component={this.state.components.get(task.get('component'))} />
                    ) : (
                      <span>{task.get('componentUrl') ? task.get('componentUrl') : task.get('component')}</span>
                    )}
                    {index === tasks.size - 2 && !hasMoreTasks && ' and '}
                    {index < tasks.size - 2 || (index === tasks.size - 2 && hasMoreTasks && ', ')}
                  </span>
                );
              })
              .toArray()}
            {hasMoreTasks &&
              ` and ${this.props.tasks.size - this.props.tasksCount}` + String.fromCharCode(160) + 'more'}
          </span>
        )}
      </span>
    );
  }
});
