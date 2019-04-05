import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { List, fromJS } from 'immutable';
import TasksEditTable from './TasksEditTable';

export default createReactClass({
  propTypes: {
    tasks: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired
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

  _handlePhaseMove(oldIndex, newIndex) {
    const phase = this.props.tasks.get(oldIndex);
    return this.props.onChange(this.props.tasks.splice(oldIndex, 1).splice(newIndex, 0, phase));
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
