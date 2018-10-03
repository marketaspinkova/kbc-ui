import React from 'react';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import TaskSelectTableRow from './TaskSelectTableRow';
import { List } from 'immutable';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    onTaskUpdate: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return { components: ComponentsStore.getAll() };
  },

  render() {
    let tasks = List();
    this.props.tasks.forEach(phase => {
      tasks = tasks.push(this.renderPhaseRow(phase.get('id')));
      const tasksRows = phase.get('tasks').map((task, index) => {
        return (
          <TaskSelectTableRow
            key={index}
            task={task}
            component={this.state.components.get(task.get('component'))}
            onTaskUpdate={this.props.onTaskUpdate}
          />
        );
      });
      tasks = tasks.concat(tasksRows);
      return tasks;
    });

    return (
      <table className="table table-stripped kbc-table-layout-fixed">
        <thead>
          <tr>
            <th>Component</th>
            <th style={{ width: '22%' }}>Action</th>
            <th style={{ width: '30%' }}>Parameters</th>
            <th style={{ width: '8%' }}>Active</th>
          </tr>
        </thead>
        <tbody>
          {tasks.count() ? (
            tasks.toArray()
          ) : (
            <tr>
              <td colSpan={4} className="text-muted">
                There are no tasks assigned yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  },

  renderPhaseRow(phaseId) {
    return (
      <tr className="text-center" key={`phase-${phaseId}`}>
        <td colSpan={4}>
          <strong>{phaseId}</strong>
        </td>
      </tr>
    );
  }
});
