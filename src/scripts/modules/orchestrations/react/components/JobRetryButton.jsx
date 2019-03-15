import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { List, fromJS } from 'immutable';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import JobsStore from '../../stores/OrchestrationJobsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import JobActionCreators from '../../ActionCreators';

import TaskSelectModal from '../modals/TaskSelect';

export default createReactClass({
  mixins: [createStoreMixin(JobsStore)],

  propTypes: {
    job: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    notify: PropTypes.bool
  },

  getDefaultProps() {
    return { tooltipPlacement: 'top' };
  },

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getInitialState() {
    return {
      components: ComponentsStore.getAll(),
      isSaving: false
    };
  },

  getStateFromStores() {
    const jobId = this._getJobId();
    return { job: JobsStore.getJob(jobId) };
  },

  _handleRun() {
    return JobActionCreators.retryOrchestrationJob(
      this.state.job.get('id'),
      this.state.job.get('orchestrationId'),
      this.props.notify
    );
  },

  _canBeRetried() {
    const status = this.state.job.get('status');

    return (
      status === 'success' ||
      status === 'error' ||
      status === 'cancelled' ||
      status === 'canceled' ||
      status === 'terminated' ||
      status === 'warning' ||
      status === 'warn'
    );
  },

  render() {
    const tasks = this.state.job.get('tasks');
    if (this._canBeRetried() && tasks) {
      const editingTasks = JobsStore.getEditingValue(this.props.job.get('id'), 'tasks') || List();

      return (
        <TaskSelectModal
          job={this.props.job}
          tasks={fromJS(JobActionCreators.rephaseTasks(editingTasks.toJS()))}
          onTaskUpdate={this._handleTaskChange}
          onTasksUpdate={this._handleTasksChange}
          onRun={this._handleRun}
          onOpen={this._handleRetrySelectStart}
          isSaving={this.props.isSaving}
        />
      );
    }

    return null;
  },

  reactivateJobTasks() {
    const enabledTaskStatuses = this.props.job.getIn(['results', 'tasks'], List()).filter(task => task.get('active'));
    const jobSucceeded = this.props.job.get('status') === 'success';
    let failedPhaseId = null;
    return enabledTaskStatuses.forEach(task => {
      const isTaskFailed = task.get('status') !== 'success';
      if (isTaskFailed && !failedPhaseId) {
        failedPhaseId = task.get('phase');
      }
      const previouslyFailed = failedPhaseId && (failedPhaseId !== task.get('phase'));
      return this._handleTaskChange(task.set('active', jobSucceeded || isTaskFailed || previouslyFailed));
    });
  },

  _handleRetrySelectStart() {
    JobActionCreators.startJobRetryTasksEdit(this.state.job.get('id'));
    return this.reactivateJobTasks();
  },

  _handleTaskChange(updatedTask) {
    const tasks = JobsStore.getEditingValue(this.props.job.get('id'), 'tasks');
    if (tasks) {
      const index = tasks.findIndex(task => task.get('id') === updatedTask.get('id'));
      return JobActionCreators.updateJobRetryTasksEdit(
        this.props.job.get('id'),
        tasks.set(index, tasks.get(index).set('active', updatedTask.get('active')))
      );
    }
  },

  _handleTasksChange(updatedTasks) {
    let tasks = List();

    updatedTasks.forEach(phase => {
      tasks = tasks.concat(phase.get('tasks'));
    });

    return JobActionCreators.updateJobRetryTasksEdit(this.props.job.get('id'), tasks);
  }
});
