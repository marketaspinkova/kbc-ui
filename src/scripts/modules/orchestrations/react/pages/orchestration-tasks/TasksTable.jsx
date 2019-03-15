import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import TasksTableRow from './TasksTableRow';
import PhaseRow from './PhaseRow';

export default createReactClass({
  propTypes: {
    tasks: PropTypes.object.isRequired,
    orchestration: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    onRun: PropTypes.func.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired
  },

  _handleTaskRun(task) {
    return this.props.onRun(task);
  },

  render() {
    return (
      <Table responsive striped>
        <thead>
          <tr>
            <th style={{ width: '31%' }}>Component</th>
            <th style={{ width: '31%' }}>Configuration</th>
            <th style={{ width: '12%' }}>Action</th>
            <th style={{ width: '8%' }}>Active</th>
            <th style={{ width: '8%' }}>Continue on Failure</th>
            <th style={{ width: '16%' }} />
          </tr>
        </thead>
        <tbody>
          {this.props.tasks.count() ? (
            this.renderPhasedTasksRows()
          ) : (
            <tr>
              <td colSpan="6" className="text-muted">
                There are no tasks assigned yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  },

  renderPhasedTasksRows() {
    let result = List();
    let idx = 0;
    this.props.tasks.map(phase => {
      const isPhaseHidden = this.isPhaseHidden(phase);
      idx++;
      const color = idx % 2 > 0 ? '#fff' : '#f9f9f9'; // 'rgb(227, 248, 255)'
      const tasksRows = phase.get('tasks').map(task => {
        return (
          <TasksTableRow
            color={color}
            task={task}
            orchestration={this.props.orchestration}
            component={this.props.components.get(task.get('component'))}
            key={task.get('id')}
            onRun={this._handleTaskRun}
          />
        );
      });
      const phaseRow = this.renderPhaseRow(phase, isPhaseHidden, color);
      result = result.push(phaseRow);
      if (!isPhaseHidden) {
        return (result = result.concat(tasksRows));
      }
    });
    return result.toArray();
  },

  renderPhaseRow(phase, isPhaseHidden, color) {
    const phaseId = phase.get('id');
    const isHidden = this.isPhaseHidden(phase);
    return (
      <PhaseRow
        isPhaseHidden={isPhaseHidden}
        color={color}
        key={phaseId}
        phase={phase}
        toggleHide={() => {
          return this.props.updateLocalState(['phases', phaseId, 'isHidden'], !isHidden);
        }}
      />
    );
  },

  isPhaseHidden(phase) {
    return this.props.localState.getIn(['phases', phase.get('id'), 'isHidden'], false);
  }
});
