import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List, fromJS } from 'immutable';
import underscoreString from 'underscore.string';
import Sortable from 'react-sortablejs';
import TasksEditTableRow from './TasksEditTableRow';
import PhaseEditRow from './PhaseEditRow';
import PhaseModal from '../../modals/Phase';
import MergePhasesModal from '../../modals/MergePhasesModal';
import MoveTasksModal from '../../modals/MoveTasksModal';
import AddTaskModal from '../../modals/add-task/AddTaskModal';
import EmptyState from '../../../../components/react/components/ComponentEmptyState';
import { Table, DropdownButton } from 'react-bootstrap';
import AboutPhases from '../../components/AboutPhases';
import ComponentsStore from '../../../../components/stores/ComponentsStore';

export default createReactClass({
  propTypes: {
    tasks: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    onTaskDelete: PropTypes.func.isRequired,
    onTaskUpdate: PropTypes.func.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired,
    handlePhaseMove: PropTypes.func.isRequired,
    handlePhaseUpdate: PropTypes.func.isRequired,
    handlePhasesSet: PropTypes.func.isRequired,
    handleAddTask: PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        {this.renderPhaseModal()}
        {this.renderMergePhaseModal()}
        {this.renderMoveTasksModal()}
        {this.renderAddTaskModal()}
        {this.renderTable()}
      </span>
    );
  },

  renderTable() {
    const head = (
      <thead data-id="static-head">
        <tr>
          <th style={{ width: '10%' }}>{this.renderHeaderActionButtons()}</th>
          <th style={{ width: '26%' }}>Component</th>
          <th style={{ width: '26%' }}>Configuration</th>
          <th style={{ width: '12%' }}>Action</th>
          <th style={{ width: '8%' }}>Active</th>
          <th style={{ width: '8%' }}>Continue on Failure</th>
          <th style={{ width: '10%' }} />
        </tr>
      </thead>
    );

    if (!this.props.tasks.count()) {
      return (
        <Table responsive striped>
          {head}
          <tbody>
            <tr>
              <td className="text-muted" colSpan="7">
                There are no tasks assigned yet. Please start by adding the first task.
              </td>
            </tr>
          </tbody>
        </Table>
      )
    }

    return (
      <div className="table-responsive">
        <Sortable
          tag="table"
          className="table table-striped"
          options={{
            filter: 'thead',
            handle: '.fa-bars',
            animation: 100
          }}
          onChange={(order, sortable, event) => {
            console.log(order); // eslint-disable-line
            console.log(sortable); // eslint-disable-line
            console.log(event); // eslint-disable-line
          }}
        >
          {head}
          {this.renderPhasedTasksRows()}
        </Sortable>
      </div>
    );

  },

  renderHeaderActionButtons() {
    return (
      <ul className="nav nav-stacked">
        <DropdownButton
          bsStyle="link"
          style={{ paddingLeft: 0 }}
          title={<span>Actions</span>}
          id="modules-orchestrations-react-pages-orchestration-tasks-tasks-edit-table-dropdown"
        >
          <li className={this.canMergePhases() ? '' : 'disabled'}>
            <a onClick={this.canMergePhases() ? this.toggleMergePhases : () => null}>
              <small>{' Merge selected phases'}</small>
            </a>
          </li>
          <li className={this.canMoveTasks() ? '' : 'disabled'}>
            <a onClick={this.canMoveTasks() ? this.onToggleMoveTasks : () => null}>
              <small>{' Move selected tasks between phases'}</small>
            </a>
          </li>
          <li>
            <a onClick={this.onToggleCollapsePhases}>
              <small>{' Collapse/Expand phases'}</small>
            </a>
          </li>
          <li>
            <a onClick={this.onGroupTasksETL}>
              <small>{' Group tasks into phases by component type'}</small>
            </a>
          </li>
        </DropdownButton>
      </ul>
    );
  },

  onGroupTasksETL() {
    const tasksTypes = ['application', 'extractor', 'transformation', 'writer', 'other'];
    const allTypes = ComponentsStore.getComponentsTypes();
    for (let type of allTypes) {
      if (!tasksTypes.includes(type)) {
        tasksTypes.push(type);
      }
    }
    let groupedPhases = fromJS(tasksTypes).map(type => {
      const capitalizedName = underscoreString.capitalize(type);
      return Map({ id: `${capitalizedName} phase`, tasks: List(), type });
    });
    this.props.tasks.map(p =>
      p.get('tasks').map(task => {
        const component = ComponentsStore.getComponent(task.get('component'));
        const taskType = component && component.get('type') ? component.get('type') : 'other';
        groupedPhases = groupedPhases.map(gp => {
          if (gp.get('type') === taskType) {
            return gp.set('tasks', gp.get('tasks').push(task));
          } else {
            return gp;
          }
        });
        return task;
      })
    );
    groupedPhases = groupedPhases.map(gp => gp.delete('type'));
    groupedPhases = groupedPhases.filter(gp => gp.get('tasks').count() > 0);
    return this.props.handlePhasesSet(groupedPhases);
  },

  onToggleCollapsePhases() {
    let phases = this.props.localState.get('phases', Map());
    let allHidden = phases.reduce((item, p) => item && p.get('isHidden', false), true);
    phases = this.props.tasks
      .map(phase => {
        return Map({ phaseId: phase.get('id'), isHidden: !allHidden });
      })
      .toMap()
      .mapKeys((key, phase) => phase.get('phaseId'));

    return this.props.updateLocalState('phases', phases);
  },

  renderPhasedTasksRows() {
    return this.props.tasks
      .map((phase, index) => {
        const color = (index + 1) % 2 > 0 ? '#fff' : '#f9f9f9';
        return this.renderPhaseRow(phase, color);
      })
      .toArray();
  },

  renderEmptyTasksRow(phaseId, color) {
    return (
      <tr style={{ backgroundColor: color }} key={`empty-phase-row-${phaseId}`}>
        <td className="text-muted" colSpan={7}>
          <EmptyState>
            <span>{`No tasks assigned to ${phaseId} yet. Empty phases will not be saved. `}</span>
            <AboutPhases />
            <div>
              <button
                className="btn btn-success btn-sm"
                onClick={() => this.props.updateLocalState(['newTask', 'phaseId'], phaseId)}
              >
                <i className="kbc-icon-plus" />
                New task
              </button>
            </div>
          </EmptyState>
        </td>
      </tr>
    );
  },

  renderAddTaskModal() {
    return (
      <AddTaskModal
        onConfigurationSelect={this.props.handleAddTask}
        phaseId={this.props.localState.getIn(['newTask', 'phaseId'])}
        show={!!this.props.localState.getIn(['newTask', 'phaseId'])}
        onHide={() => this.props.updateLocalState(['newTask'], Map())}
        onChangeSearchQuery={query => this.props.updateLocalState(['newTask', 'searchQuery'], query)}
        searchQuery={this.props.localState.getIn(['newTask', 'searchQuery'], '')}
      />
    );
  },

  renderMoveTasksModal() {
    return (
      <MoveTasksModal
        show={this.props.localState.getIn(['moveTasks', 'show'], false)}
        phases={this.props.tasks.map(phase => phase.get('id'))}
        onHide={() => this.props.updateLocalState(['moveTasks', 'show'], false)}
        onMoveTasks={phaseId => {
          const markedTasks = this.props.localState.getIn(['moveTasks', 'marked']);
          this._moveTasks(phaseId, markedTasks);
          return this.props.updateLocalState('moveTasks', Map());
        }}
      />
    );
  },

  onToggleMoveTasks() {
    return this.props.updateLocalState(['moveTasks', 'show'], true);
  },

  _moveTasks(phaseId, markedTasks) {
    let found = true;
    let phase = this.props.tasks.find(p => p.get('id') === phaseId);
    if (!phase) {
      phase = Map({ id: phaseId });
      found = false;
    }
    const destinationTasks = phase.get('tasks', List());
    const tasksToMerge = markedTasks.filter(mt => !destinationTasks.find(dt => dt.get('id') === mt.get('id'))).toList();
    const resultTasks = destinationTasks.concat(tasksToMerge);
    const newPhase = phase.set('tasks', resultTasks);
    let newPhases = this.props.tasks.map(p => {
      if (p.get('id') === phaseId) {
        return newPhase;
      }
      const tmpTasks = p.get('tasks').filter(t => !markedTasks.has(t.get('id')));
      return p.set('tasks', tmpTasks);
    });

    if (!found) {
      newPhases = newPhases.push(newPhase);
    }
    return this.props.handlePhasesSet(newPhases);
  },

  _toggleMarkTask(task) {
    let markTask = task;
    const path = ['moveTasks', 'marked', task.get('id')];
    // invert true/false task/null
    if (this.props.localState.getIn(path, null) !== null) {
      markTask = null;
    }
    return this.props.updateLocalState(path, markTask);
  },

  renderPhaseRow(phase, color) {
    const phaseId = phase.get('id');
    const isHidden = this.isPhaseHidden(phase);

    return (
      <tbody key={phaseId} data-id={phaseId}>
        <PhaseEditRow
          isPhaseHidden={isHidden}
          phase={phase}
          color={color}
          onMarkPhase={this.toggleMarkPhase}
          isMarked={this.props.localState.hasIn(['markedPhases', phaseId])}
          toggleHide={() => this.props.updateLocalState(['phases', phaseId, 'isHidden'], !isHidden)}
          togglePhaseIdChange={this.togglePhaseIdEdit}
          toggleAddNewTask={() => this.props.updateLocalState(['newTask', 'phaseId'], phase.get('id'))}
        />
        {this.renderTasksRows(phase, color)}
      </tbody>
    );
  },

  renderTasksRows(phase, color) {
    if (this.isPhaseHidden(phase)) {
      return null;
    }

    const tasksRows = phase.get('tasks').map((task, index) => {
      const taskId = task.get('id');

      return (
        <TasksEditTableRow
          key={`${index}-${taskId}`}
          task={task}
          color={color}
          component={this.props.components.get(task.get('component'))}
          disabled={this.props.disabled}
          onTaskDelete={this.props.onTaskDelete}
          onTaskUpdate={this.props.onTaskUpdate}
          isMarked={this.props.localState.hasIn(['moveTasks', 'marked', taskId])}
          toggleMarkTask={() => this._toggleMarkTask(task)}
          onMoveSingleTask={() => this._toggleMoveSingleTask(task, phase.get('id'))}
        />
      );
    });

    if (!tasksRows.count()) {
      return this.renderEmptyTasksRow(phase.get('id'), color);
    }

    return tasksRows;
  },

  renderPhaseModal() {
    let phaseId = this.props.localState.get('editingPhaseId');
    const existingIds = this.props.tasks.map(phase => phase.get('id')).filter(pId => pId !== phaseId);
    return (
      <PhaseModal
        phaseId={phaseId}
        show={this.isEditingPhaseId()}
        onPhaseUpdate={newId => {
          phaseId = this.props.localState.get('editingPhaseId');
          const phase = this.props.tasks.find(p => p.get('id') === phaseId);
          this.props.handlePhaseUpdate(phaseId, phase.set('id', newId));
          return this.hidePhaseIdEdit();
        }}
        onHide={this.hidePhaseIdEdit}
        existingIds={existingIds}
      />
    );
  },

  renderMergePhaseModal() {
    return (
      <MergePhasesModal
        show={this.props.localState.get('mergePhases', false)}
        onHide={() => {
          return this.props.updateLocalState('mergePhases', false);
        }}
        tasks={this.props.tasks}
        phases={this.props.tasks.map(phase => phase.get('id'))}
        onMergePhases={this._mergePhases}
      />
    );
  },

  canMergePhases() {
    return this.props.localState.get('markedPhases', Map()).find(isMarked => isMarked === true);
  },

  toggleMergePhases() {
    return this.props.updateLocalState('mergePhases', true);
  },

  _mergePhases(destinationPhaseId) {
    const markedPhases = this.props.localState.get('markedPhases');
    let mergedTasks = List();
    // find the best suitable position for new phase
    const markedPhasesIndexes = markedPhases
      .filter(isMarked => isMarked === true)
      .map((_, phaseId) => {
        return this.props.tasks.findIndex(phase => phase.get('id') === phaseId);
      });
    const newPhasePosition = markedPhasesIndexes.min();

    // filter only those not selected and not choosed to merge to and
    // concat their tasks
    let newPhases = this.props.tasks.filter(phase => {
      const pid = phase.get('id');
      const isMarked = markedPhases.get(pid);
      if (isMarked || destinationPhaseId === pid) {
        mergedTasks = mergedTasks.concat(phase.get('tasks'));
      }
      return !isMarked || destinationPhaseId === pid;
    });
    let found = false;
    // if merging into existing phase then replace its tasks
    newPhases = newPhases.map(ph => {
      if (ph.get('id') === destinationPhaseId) {
        found = true;
        return ph.set('tasks', mergedTasks);
      } else {
        return ph;
      }
    }, found);
    // if not merging into existing phase then push new phase to the end
    if (!found) {
      const newPhase = Map({ id: destinationPhaseId }).set('tasks', mergedTasks);
      newPhases = newPhases.splice(newPhasePosition, 0, newPhase);
    }
    // save to the store
    this.props.handlePhasesSet(newPhases);
    // reset marked phases state
    this.props.updateLocalState([], Map());
    return true;
  },

  canMoveTasks() {
    return this.props.localState.getIn(['moveTasks', 'marked'], Map()).find(task => task !== null);
  },

  toggleMarkPhase(phaseId, shiftKey) {
    let marked;
    if (!shiftKey) {
      marked = this.props.localState.getIn(['markedPhases', phaseId], false);
      return this.props.updateLocalState(['markedPhases', phaseId], !marked);
    }
    let markedPhases = this.props.localState.get('markedPhases');
    let isInMarkingRange = false;
    let isAfterMarkingRange = false;
    this.props.tasks.forEach(phase => {
      const pId = phase.get('id');
      marked = this.props.localState.getIn(['markedPhases', pId], false);
      if (marked && !isInMarkingRange) {
        isInMarkingRange = true;
      }
      if (isInMarkingRange && !isAfterMarkingRange) {
        markedPhases = markedPhases.set(pId, true);
      }
      if (pId === phaseId) {
        return (isAfterMarkingRange = true);
      }
    });
    return this.props.updateLocalState('markedPhases', markedPhases);
  },

  hidePhaseIdEdit() {
    return this.props.updateLocalState(['editingPhaseId'], null);
  },

  togglePhaseIdEdit(phaseId) {
    return this.props.updateLocalState(['editingPhaseId'], phaseId);
  },

  isEditingPhaseId() {
    return !!this.props.localState.get('editingPhaseId');
  },

  isPhaseHidden(phase) {
    return this.props.localState.getIn(['phases', phase.get('id'), 'isHidden'], false);
  }
});
