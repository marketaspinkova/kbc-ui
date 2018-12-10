/* eslint-disable react/no-multi-comp */
// ^ due to false positive
import React from 'react';
import { Link } from 'react-router';
import RoutesStore from '../../stores/RoutesStore';
import { List } from 'immutable';
import dispatcher from '../../Dispatcher';
import * as constants from './Constants';
import orchestrationsApi from './OrchestrationsApi';
import jobsApi from '../jobs/JobsApi';
import OrchestrationStore from './stores/OrchestrationsStore';
import OrchestrationJobsStore from './stores/OrchestrationJobsStore';
import Promise from 'bluebird';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import VersionsActionCreators from '../components/VersionsActionCreators';
import InstalledComponentsActionCreators from '../components/InstalledComponentsActionCreators';

const rephaseTasks = tasks => {
  const isNullPhase = phase => phase === null || phase === 0 || typeof phase === 'undefined';
  let nullPhaseIdx = 1;
  let currentPhase = { id: null };
  const result = [];
  for (let task of tasks) {
    const { phase } = task;
    if (isNullPhase(phase) || phase.toString() !== currentPhase.id) {
      let newPhaseId = phase;
      if (isNullPhase(phase)) {
        newPhaseId = `Phase ${nullPhaseIdx}`;
        nullPhaseIdx++;
      }
      // create new phase
      const newPhase = {
        id: `${newPhaseId}`,
        tasks: [task]
      };
      currentPhase = newPhase;
      result.push(newPhase);
    } else {
      currentPhase.tasks.push(task);
    }
  }
  // return tasks
  return result;
};

const dephaseTasks = tasks => {
  let result = List();
  tasks.forEach(phase => {
    const phaseId = phase.get('id');
    return phase.get('tasks').forEach(task => (result = result.push(task.set('phase', phaseId))));
  });
  return result;
};

export default {
  rephaseTasks(tasks) {
    return rephaseTasks(tasks);
  },
  dephaseTasks(tasks) {
    return dephaseTasks(tasks);
  },
  /*
    Request orchestrations reload from server
  */
  loadOrchestrationsForce() {
    const actions = this;

    // trigger load initialized
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATIONS_LOAD
    });

    // init load
    return orchestrationsApi
      .getOrchestrations()
      .then(orchestrations =>
        // load success
        actions.receiveAllOrchestrations(orchestrations)
      )
      .catch(err => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATIONS_LOAD_ERROR
        });
        throw err;
      });
  },

  receiveAllOrchestrations(orchestrations) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATIONS_LOAD_SUCCESS,
      orchestrations
    });
  },

  /*
    Request orchestrations load only if not alread loaded
    @return Promise
  */
  loadOrchestrations() {
    // don't load if already loaded
    if (OrchestrationStore.getIsLoaded()) {
      return Promise.resolve();
    }

    return this.loadOrchestrationsForce();
  },

  /*
    Request specified orchestration load from server
    @return Promise
  */
  loadOrchestrationForce(id) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_LOAD,
      orchestrationId: id
    });

    VersionsActionCreators.loadVersionsForce('orchestrator', id.toString());

    return orchestrationsApi
      .getOrchestration(id)
      .then(this.receiveOrchestration)
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_LOAD_ERROR
        });
        throw error;
      });
  },

  receiveOrchestration(orchestration) {
    orchestration.tasks = rephaseTasks(orchestration.tasks);
    const crontabRecord = orchestration.crontabRecord;
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_LOAD_SUCCESS,
      orchestration,
      crontabRecord
    });
  },

  loadOrchestration(id) {
    if (OrchestrationStore.has(id) && OrchestrationStore.hasOrchestrationTasks(id)) {
      return Promise.resolve();
    }
    return this.loadOrchestrationForce(id);
  },

  deleteOrchestration(id) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_DELETE_START,
      orchestrationId: id
    });

    const orchestration = OrchestrationStore.get(id);

    return orchestrationsApi
      .deleteOrchestration(id)
      .then(() => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_DELETE_SUCCESS,
          orchestrationId: id
        });

        return ApplicationActionCreators.sendNotification({
          message: React.createClass({
            propTypes: {
              onClick: React.PropTypes.func.isRequired
            },

            render() {
              return (
                <span>
                  {`Orchestration ${orchestration.get('name')} was moved to `}
                  <Link to="settings-trash" onClick={this.props.onClick}>
                    Trash
                  </Link>
                </span>
              );
            }
          })
        });
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_DELETE_ERROR,
          orchestrationId: id
        });
        throw e;
      });
  },

  createOrchestration(data) {
    let newOrchestration = {};
    return orchestrationsApi
      .createOrchestration(data)
      .then(orchestration => {
        newOrchestration = orchestration;
        return InstalledComponentsActionCreators.loadInstalledComponentsForce();
      })
      .then(() => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_CREATE_SUCCESS,
          orchestration: newOrchestration
        });
        return RoutesStore.getRouter().transitionTo('orchestration', { orchestrationId: newOrchestration.id });
      });
  },

  /*
    Load specifed orchestration jobs from server
  */
  loadOrchestrationJobsForce(orchestrationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD,
      orchestrationId
    });

    return orchestrationsApi
      .getOrchestrationJobs(orchestrationId)
      .then(jobs =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD_SUCCESS,
          orchestrationId,
          jobs
        })
      )
      .catch(error => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOBS_LOAD_ERROR,
          orchestrationId
        });
        throw error;
      });
  },

  loadOrchestrationJobs(orchestrationId) {
    if (OrchestrationJobsStore.hasOrchestrationJobs(orchestrationId)) {
      return Promise.resolve();
    }
    return this.loadOrchestrationJobsForce(orchestrationId);
  },

  /*
    Fetch single job from server
  */
  loadJobForce(jobId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD,
      jobId
    });

    return orchestrationsApi.getJob(jobId).then(job =>
      dispatcher.handleViewAction({
        type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS,
        orchestrationId: job.orchestrationId,
        job
      })
    );
  },

  /*
    Ensure that job is loaded, cached version is accpeted
  */
  loadJob(jobId) {
    if (OrchestrationJobsStore.getJob(jobId)) {
      return Promise.resolve();
    }
    return this.loadJobForce(jobId);
  },

  /*
    Filter orchestrations
  */
  setOrchestrationsFilter(query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATIONS_SET_FILTER,
      query
    });
  },

  activateOrchestration(id) {
    return this.changeActiveState(id, true);
  },

  disableOrchestration(id) {
    return this.changeActiveState(id, false);
  },

  changeActiveState(orchestrationId, active) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_START,
      active,
      orchestrationId
    });

    return orchestrationsApi
      .updateOrchestration(orchestrationId, { active })
      .then(response => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_SUCCESS,
          active: response.active,
          orchestrationId
        });

        return VersionsActionCreators.loadVersionsForce('orchestrator', orchestrationId.toString());
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_ACTIVE_CHANGE_ERROR,
          active,
          orchestrationId
        });
        throw e;
      });
  },

  /*
    Editing orchestration field
  */
  startOrchestrationFieldEdit(orchestrationId, fieldName) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_START,
      orchestrationId,
      field: fieldName
    });
  },

  cancelOrchestrationFieldEdit(orchestrationId, fieldName) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_CANCEL,
      orchestrationId,
      field: fieldName
    });
  },

  updateOrchestrationFieldEdit(orchestrationId, fieldName, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_FIELD_EDIT_UPDATE,
      orchestrationId,
      field: fieldName,
      value: newValue
    });
  },

  saveOrchestrationField(orchestrationId, fieldName) {
    const value = OrchestrationStore.getEditingValue(orchestrationId, fieldName);

    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_START,
      orchestrationId,
      field: fieldName
    });

    const data = {};
    data[fieldName] = value;

    return orchestrationsApi
      .updateOrchestration(orchestrationId, data)
      .then(orchestration =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_SUCCESS,
          orchestrationId,
          field: fieldName,
          orchestration
        })
      )
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_ERROR,
          orchestrationId,
          field: fieldName,
          error: e
        });
        throw e;
      });
  },

  /*
    Editing orchestration tasks
  */
  startOrchestrationTasksEdit(orchestrationId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_START,
      orchestrationId
    });
  },

  cancelOrchestrationTasksEdit(orchestrationId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_CANCEL,
      orchestrationId
    });
  },

  updateOrchestrationsTasksEdit(orchestrationId, tasks) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_TASKS_EDIT_UPDATE,
      orchestrationId,
      tasks
    });
  },

  saveOrchestrationTasks(orchestrationId) {
    let tasks = OrchestrationStore.getEditingValue(orchestrationId, 'tasks');
    tasks = dephaseTasks(tasks);
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_START,
      orchestrationId
    });

    return orchestrationsApi
      .saveOrchestrationTasks(orchestrationId, tasks.toJS())
      .then(data => {
        // update tasks from server
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_SUCCESS,
          orchestrationId,
          tasks: rephaseTasks(data)
        });
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_TASKS_SAVE_ERROR,
          orchestrationId,
          error: e
        });
        throw e;
      });
  },

  /*
    Editing tasks on job retry
  */
  startJobRetryTasksEdit(jobId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_START,
      jobId
    });
  },

  updateJobRetryTasksEdit(jobId, tasks) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_EDIT_UPDATE,
      jobId,
      tasks
    });
  },

  /*
    Editing tasks on manulal run
  */
  startOrchestrationRunTasksEdit(orchestrationId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_START,
      orchestrationId
    });
  },

  cancelOrchestrationRunTasksEdit(orchestrationId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_CANCEL,
      orchestrationId
    });
  },

  updateOrchestrationRunTasksEdit(orchestrationId, tasks) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_UPDATE,
      orchestrationId,
      tasks
    });
  },

  /*
    Editing notifications
  */
  startOrchestrationNotificationsEdit(id) {
    return this.startOrchestrationFieldEdit(id, 'notifications');
  },

  cancelOrchestrationNotificationsEdit(id) {
    return this.cancelOrchestrationFieldEdit(id, 'notifications');
  },

  updateOrchestrationNotificationsEdit(id, newNotifications) {
    return this.updateOrchestrationFieldEdit(id, 'notifications', newNotifications);
  },

  saveOrchestrationNotificationsEdit(id) {
    const notifications = OrchestrationStore.getEditingValue(id, 'notifications');

    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_START,
      orchestrationId: id,
      field: 'notifications'
    });

    return orchestrationsApi
      .saveOrchestrtionNotifications(id, notifications.toJS())
      .then(data =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_SUCCESS,
          orchestrationId: id,
          field: 'notifications',
          notifications: data
        })
      )
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_FIELD_SAVE_ERROR,
          orchestrationId: id,
          field: 'notifications',
          error: e
        });
        throw e;
      });
  },

  /*
    Editing schedule
  */
  startOrchestrationScheduleEdit(id) {
    return this.startOrchestrationFieldEdit(id, 'schedule');
  },

  cancelOrchestrationScheduleEdit(id) {
    return this.cancelOrchestrationFieldEdit(id, 'schedule');
  },

  updateOrchestrationScheduleEdit(id, newSchedule) {
    return this.updateOrchestrationFieldEdit(id, 'schedule', newSchedule);
  },

  saveOrchestrationScheduleEdit(id) {
    const crontabRecord = {crontabRecord: OrchestrationStore.getEditingValue(id, 'schedule')};

    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_SCHEDULE_SAVE_START,
      orchestrationId: id,
      field: 'schedule'
    });

    return orchestrationsApi
      .updateOrchestration(id, crontabRecord)
      .then(data =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_SCHEDULE_SAVE_SUCCESS,
          orchestrationId: id,
          field: 'schedule',
          crontabRecord: data.crontabRecord
        })
      )
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_SCHEDULE_SAVE_ERROR,
          orchestrationId: id,
          field: 'schedule',
          error: e
        });
        throw e;
      });
  },

  /*
    Run and termination
  */

  runOrchestration(id, tasks, notify = false) {
    let data = {};
    if (tasks) {
      data = { tasks: dephaseTasks(tasks) };
    }

    return orchestrationsApi.runOrchestration(id, data).then(newJob => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS,
        orchestrationId: newJob.orchestrationId,
        job: newJob
      });
      if (tasks) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_RUN_TASK_EDIT_SUCCESS,
          orchestrationId: newJob.orchestrationId
        });
      }
      if (notify) {
        return ApplicationActionCreators.sendNotification({
          message: React.createClass({
            propTypes: {
              onClick: React.PropTypes.func.isRequired
            },

            render() {
              return (
                <span>
                  <Link
                    to="orchestrationJob"
                    params={{
                      jobId: newJob.id,
                      orchestrationId: id
                    }}
                    onClick={this.props.onClick}
                  >
                    Orchestrator job
                  </Link>
                  {' has been scheduled'}
                </span>
              );
            }
          })
        });
      }
    });
  },

  terminateJob(jobId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_START,
      jobId
    });

    return jobsApi
      .terminateJob(jobId)
      .then(() => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_SUCCESS,
          jobId
        });
        return this.loadJobForce(jobId);
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOB_TERMINATE_ERROR,
          jobId
        });
        throw e;
      });
  },

  retryOrchestrationJob(jobId, orchestrationId, notify = false) {
    const tasks = OrchestrationJobsStore.getEditingValue(jobId, 'tasks');

    dispatcher.handleViewAction({
      type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_START,
      jobId
    });

    return orchestrationsApi
      .retryJob(jobId, tasks)
      .then(newJob => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_SUCCESS,
          jobId,
          job: newJob
        });
        this.loadOrchestrationJobsForce(orchestrationId);
        if (notify) {
          return ApplicationActionCreators.sendNotification({
            message: React.createClass({
              propTypes: {
                onClick: React.PropTypes.func.isRequired
              },

              render() {
                return (
                  <span>
                    {'Orchestration scheduled. You can track the progress '}
                    <Link
                      to="orchestrationJob"
                      params={{
                        jobId: newJob.id,
                        orchestrationId
                      }}
                      onClick={this.props.onClick}
                    >
                      here
                    </Link>
                  </span>
                );
              }
            })
          });
        }
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.ORCHESTRATION_JOB_RETRY_ERROR,
          jobId
        });
        throw e;
      });
  }
};
