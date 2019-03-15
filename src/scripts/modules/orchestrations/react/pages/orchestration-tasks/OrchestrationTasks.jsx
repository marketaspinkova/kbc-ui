import React from 'react';
import createReactClass from 'create-react-class';
import { List, Map } from 'immutable';

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
import TasksTable from './TasksTable';
import TasksEditor from './TasksEditor';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

const componentId = 'orchestrations';

const OrchestrationTasks = createReactClass({
  mixins: [createStoreMixin(OrchestrationStore, ComponentsStore, InstalledComponentsStore)],

  getStateFromStores() {
    let tasks;
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const localState = InstalledComponentsStore.getLocalState(componentId, orchestrationId);

    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'tasks');
    if (isEditing) {
      tasks = OrchestrationStore.getEditingValue(orchestrationId, 'tasks');
    } else {
      tasks = OrchestrationStore.getOrchestrationTasks(orchestrationId);
    }
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
    // start edit if orchestration is empty
    if (!this.state.isEditing && this.state.tasks.count() === 0) {
      return OrchestrationsActionCreators.startOrchestrationTasksEdit(this.state.orchestration.get('id'));
    }
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

  _handleTaskRun(task) {
    let tasks;
    if (this.state.tasks.count()) {
      tasks = this.state.tasks.map(phase =>
        phase.set(
          'tasks',
          phase.get('tasks').map(item => {
            if (item.get('id') === task.get('id')) {
              return item.set('active', true);
            } else {
              return item.set('active', false);
            }
          })
        )
      );
    } else {
      tasks = List();
    }

    return OrchestrationsActionCreators.runOrchestration(this.state.orchestration.get('id'), tasks, true);
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this.state.isEditing ? (
            <div>
              <TasksEditor
                tasks={this.state.tasks}
                isSaving={this.state.isSaving}
                components={this.state.components}
                onChange={this._handleTasksChange}
                localState={this.state.localState.get('taskstable', Map())}
                updateLocalState={(path, data) => {
                  return this.updateLocalState(['taskstable'].concat(path), data);
                }}
              />
            </div>
          ) : (
            <div>
              <TasksTable
                tasks={this.state.tasks}
                orchestration={this.state.orchestration}
                components={this.state.components}
                onRun={this._handleTaskRun}
                localState={this.state.localState.get('taskstable', Map())}
                updateLocalState={(path, data) => {
                  return this.updateLocalState(['taskstable'].concat(path), data);
                }}
              />
            </div>
          )}
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
  }
});

export default DragDropContext(HTML5Backend)(OrchestrationTasks);
