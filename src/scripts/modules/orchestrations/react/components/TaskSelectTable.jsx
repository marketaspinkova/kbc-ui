import React from 'react';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import TaskSelectTableRow from './TaskSelectTableRow';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    onTaskUpdate: React.PropTypes.func.isRequired,
    onTasksUpdate: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return { components: ComponentsStore.getAll() };
  },

  render() {
    const allActive = this.isAllActive();

    return (
      <Table striped responsive>
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Component</th>
            <th style={{ width: '15%' }}>Action</th>
            <th style={{ width: '30%' }}>Parameters</th>
            <th style={{ width: '15%' }}>
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={allActive} onChange={() => this.handleActiveAll(allActive)} />
                  Select All
                </label>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>{this.renderTasks()}</tbody>
      </Table>
    );
  },

  handleActiveAll(active) {
    const updatedTasks = this.props.tasks.map(phase => {
      return phase.set('tasks', phase.get('tasks').map(task => task.set('active', !active)));
    });

    this.props.onTasksUpdate(updatedTasks);
  },

  renderTasks() {
    let tasks = List();
    this.props.tasks.forEach(phase => {
      const phaseId = phase.get('id');
      const tasksRows = phase.get('tasks').map((task, index) => {
        return (
          <TaskSelectTableRow
            key={`phase-${phaseId}-task-${index}`}
            task={task}
            component={this.state.components.get(task.get('component'))}
            onTaskUpdate={this.props.onTaskUpdate}
          />
        );
      });
      tasks = tasks.push(this.renderPhaseRow(phaseId)).concat(tasksRows);
    });

    if (!tasks.count()) {
      return (
        <tr>
          <td colSpan={4} className="text-muted">
            There are no tasks assigned yet.
          </td>
        </tr>
      );
    }

    return tasks.toArray();
  },

  renderPhaseRow(phaseId) {
    return (
      <tr className="text-center" key={`phase-${phaseId}`}>
        <td colSpan={4}>
          <strong>{phaseId}</strong>
        </td>
      </tr>
    );
  },

  isAllActive() {
    let allActive = true;

    this.props.tasks.forEach(phase => {
      phase.get('tasks').forEach(task => {
        if (allActive && !task.get('active')) {
          allActive = false;
        }
      });
    });

    return allActive;
  }
});
