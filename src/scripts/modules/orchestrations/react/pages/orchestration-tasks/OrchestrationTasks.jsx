import React from 'react';
import _ from 'underscore';
import { List, Map, fromJS } from 'immutable';

// actions and stores
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../../ActionCreators';
import installedComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';

import mergeTasksWithConfigurations from '../../../mergeTasksWithConfigruations';

// React components
import TasksEditTable from './TasksEditTable';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';

const componentId = 'orchestrations';

const OrchestrationTasks = React.createClass({
  mixins: [createStoreMixin(OrchestrationStore, ComponentsStore, InstalledComponentsStore)],

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const localState = InstalledComponentsStore.getLocalState(componentId, orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'tasks');
    const editingValues = OrchestrationStore.getEditingValue(orchestrationId, 'tasks');
    const tasks = isEditing ? editingValues : OrchestrationStore.getOrchestrationTasks(orchestrationId);
    const tasksWithConfig = mergeTasksWithConfigurations(tasks, InstalledComponentsStore.getAll());

    return {
      localState: localState || Map(),
      orchestrationId,
      orchestration: OrchestrationStore.get(orchestrationId),
      tasks: tasksWithConfig,
      components: ComponentsStore.getAll(),
      filter: OrchestrationStore.getFilter(),
      isEditing,
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'tasks'),
      filteredOrchestrations: OrchestrationStore.getFiltered()
    };
  },

  componentDidMount() {
    return OrchestrationsActionCreators.startOrchestrationTasksEdit(this.state.orchestration.get('id'));
  },

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  _handleFilterChange(query) {
    return OrchestrationsActionCreators.setOrchestrationsFilter(query);
  },

  _handleTasksChange(newTasks) {
    return OrchestrationsActionCreators.updateOrchestrationsTasksEdit(this.state.orchestration.get('id'), newTasks);
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-block-with-padding">
            <ConfirmButtons
              isSaving={this.state.isSaving}
              onCancel={this._handleCancel}
              onSave={this._handleSave}
              isDisabled={!this.state.isEditing}
              className="text-right"
            />
          </div>
          <TasksEditTable
            tasks={this.state.tasks}
            components={this.state.components}
            disabled={this.state.isSaving}
            onChange={this._handleTasksChange}
            onTaskDelete={this._handleTaskDelete}
            onTaskUpdate={this._handleTaskUpdate}
            updateLocalState={(path, data) => {
              return this.updateLocalState(['taskstable'].concat(path), data);
            }}
            localState={this.state.localState.get('taskstable', Map())}
            handlePhaseMove={this._handlePhaseMove}
            handlePhaseUpdate={this._handlePhaseUpdate}
            handlePhasesSet={this._handlePhasesSet}
            handleAddTask={this._handleTaskAdd}
          />
        </div>
      </div>
    );
  },

  updateLocalState(path, data) {
    let newState;
    if (data !== null) {
      newState = this.state.localState.setIn([].concat(path), data);
    } else {
      newState = this.state.localState.deleteIn([].concat(path), data);
    }

    return installedComponentsActions.updateLocalState(componentId, this.state.orchestrationId, newState, path);
  },

  _handleTaskDelete(configurationId) {
    return this._handleTasksChange(
      this.state.tasks.map(phase => {
        let tasks = phase.get('tasks');
        tasks = tasks.filter(task => task.get('id') !== configurationId);
        return phase.set('tasks', tasks);
      })
    );
  },

  _handlePhaseUpdate(phaseId, newPhase) {
    const phaseIdx = this.state.tasks.findIndex(phase => phase.get('id') === phaseId);
    const newTasks = this.state.tasks.set(phaseIdx, newPhase);
    return this._handleTasksChange(newTasks);
  },

  _handlePhasesSet(phases) {
    return this._handleTasksChange(phases);
  },

  _handleTaskUpdate(updatedTask) {
    const taskId = updatedTask.get('id');
    const newTasks = this.state.tasks.map(phase => {
      const tasks = phase.get('tasks').map(task => {
        return task.get('id') === taskId ? updatedTask : task;
      });
      return phase.set('tasks', tasks);
    });
    return this._handleTasksChange(newTasks);
  },

  _handlePhaseMove(id, afterId) {
    const phase = this.state.tasks.find(item => item.get('id') === id);
    const currentIndex = this.state.tasks.findIndex(item => item.get('id') === id);
    const afterIndex = this.state.tasks.findIndex(item => item.get('id') === afterId);
    return this._handleTasksChange(this.state.tasks.splice(currentIndex, 1).splice(afterIndex, 0, phase));
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

    return this._handleTasksChange(
      this.state.tasks.map(phase => {
        if (phase.get('id') === phaseId) {
          return phase.set('tasks', phase.get('tasks', List()).push(fromJS(task)));
        } else {
          return phase;
        }
      })
    );
  },


  _handleSave() {
    return OrchestrationsActionCreators.saveOrchestrationTasks(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationTasksEdit(this.state.orchestrationId);
  },

  _handleStart() {
    return OrchestrationsActionCreators.startOrchestrationTasksEdit(this.state.orchestrationId);
  }

});

export default DragDropContext(HTML5Backend)(OrchestrationTasks);
