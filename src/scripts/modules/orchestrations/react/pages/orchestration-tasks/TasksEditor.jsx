import React from 'react';
import _ from 'underscore';
import { List, fromJS } from 'immutable';
import TasksEditTable from './TasksEditTable';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    components: React.PropTypes.object.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired,
    updateLocalState: React.PropTypes.func.isRequired,
    localState: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <TasksEditTable
        tasks={this.props.tasks}
        components={this.props.components}
        disabled={this.props.isSaving}
        onTaskDelete={this._handleTaskDelete}
        onTaskUpdate={this._handleTaskUpdate}
        updateLocalState={this.props.updateLocalState}
        localState={this.props.localState}
        handlePhaseMove={this._handlePhaseMove}
        handlePhaseUpdate={this._handlePhaseUpdate}
        handlePhasesSet={this._handlePhasesSet}
        handleAddTask={this._handleTaskAdd}
      />
    );
  },

  _handleTaskDelete(configurationId) {
    return this.props.onChange(
      this.props.tasks.map(phase => {
        let tasks = phase.get('tasks');
        tasks = tasks.filter(task => task.get('id') !== configurationId);
        return phase.set('tasks', tasks);
      })
    );
  },

  _handlePhaseUpdate(phaseId, newPhase) {
    const phaseIdx = this.props.tasks.findIndex(phase => phase.get('id') === phaseId);
    const newTasks = this.props.tasks.set(phaseIdx, newPhase);
    return this.props.onChange(newTasks);
  },

  _handlePhasesSet(phases) {
    return this.props.onChange(phases);
  },

  _handleTaskUpdate(updatedTask) {
    const taskId = updatedTask.get('id');
    const newTasks = this.props.tasks.map(phase => {
      const tasks = phase.get('tasks').map(task => {
        return task.get('id') === taskId ? updatedTask : task;
      });
      return phase.set('tasks', tasks);
    });
    return this.props.onChange(newTasks);
  },

  _handlePhaseMove(id, afterId) {
    const phase = this.props.tasks.find(item => item.get('id') === id);
    const currentIndex = this.props.tasks.findIndex(item => item.get('id') === id);
    const afterIndex = this.props.tasks.findIndex(item => item.get('id') === afterId);
    return this.props.onChange(this.props.tasks.splice(currentIndex, 1).splice(afterIndex, 0, phase));
  },

  _handleTaskAdd(component, configuration, phaseId) {
    // prepare task
    const task = {
      id: _.uniqueId(), // temporary id
      phase: phaseId,
      component: component.get('id'),
      action: 'run',
      actionParameters: {
        config: configuration.get('id')
      },
      continueOnFailure: false,
      active: true,
      timeoutMinutes: null
    };

    if (component.get('id') === 'gooddata-writer') {
      task.action = 'load-data';
    }

    return this.props.onChange(
      this.props.tasks.map(phase => {
        if (phase.get('id') === phaseId) {
          return phase.set('tasks', phase.get('tasks', List()).push(fromJS(task)));
        } else {
          return phase;
        }
      })
    );
  }
});
