import React from 'react';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    tasksCount: React.PropTypes.number
  },

  getDefaultProps() {
    return { tasksCount: 3 };
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
              .filter(task => task.getIn(['config', 'name'], false))
              .take(this.props.tasksCount)
              .map((task, index, tasks) => {
                return (
                  <span key={task.get('id')}>
                    {task.getIn(['config', 'name'])}
                    {index === tasks.size - 2 && !hasMoreTasks && ' and '}
                    {(index < tasks.size - 2 || (index === tasks.size - 2 && hasMoreTasks)) && ', '}
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
