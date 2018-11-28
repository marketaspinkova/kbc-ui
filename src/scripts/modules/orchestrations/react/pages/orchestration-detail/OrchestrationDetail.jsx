import React from 'react';
import { List } from 'immutable';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

// actions and stores
import OrchestrationsActionCreators from '../../../ActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import OrchestrationJobsStore from '../../../stores/OrchestrationJobsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import VersionsStore from '../../../../components/stores/VersionsStore';

// React components
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import JobsTable from './JobsTable';
import JobsGraph from './JobsGraph';
import { Link } from 'react-router';
import TasksSummary from './TasksSummary';
import CronRecord from '../../components/CronRecord';
import ScheduleModal from '../../modals/Schedule';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import OrchestrationRunButton from '../../components/OrchestrationRunButton';
import OrchestrationDeleteButton from '../../components/OrchestrationDeleteButton';
import OrchestrationActiveButton from '../../components/OrchestrationActiveButton';
import {ExternalLink} from '@keboola/indigo-ui';
import {Row, Col} from 'react-bootstrap';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import SidebarVersions from '../../../../components/react/components/SidebarVersionsWrapper';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore, OrchestrationJobsStore, VersionsStore, LatestJobsStore)],

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const jobs = OrchestrationJobsStore.getOrchestrationJobs(orchestrationId);
    const phases = OrchestrationStore.getOrchestrationTasks(orchestrationId);
    const versions = VersionsStore.getVersions('orchestrator', orchestrationId.toString());
    let tasks = List();
    phases.forEach(phase => (tasks = tasks.concat(phase.get('tasks'))));

    return {
      orchestration: OrchestrationStore.get(orchestrationId),
      tasksToRun: OrchestrationStore.getTasksToRun(orchestrationId),
      tasks,
      isLoading: OrchestrationStore.getIsOrchestrationLoading(orchestrationId),
      filteredOrchestrations: OrchestrationStore.getFiltered(),
      filter: OrchestrationStore.getFilter(),
      jobs,
      versions,
      graphJobs: jobs.filter(job => job.get('startTime') && job.get('endTime')),
      jobsLoading: OrchestrationJobsStore.isLoading(orchestrationId),
      pendingActions: OrchestrationStore.getPendingActionsForOrchestration(orchestrationId),
      latestJobs: LatestJobsStore.getJobs('orchestration', orchestrationId)
    };
  },

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  _handleFilterChange(query) {
    return OrchestrationsActionCreators.setOrchestrationsFilter(query);
  },

  _handleJobsReload() {
    return OrchestrationsActionCreators.loadOrchestrationJobsForce(this.state.orchestration.get('id'));
  },

  render() {
    return (
      <div className="container-fluid">
        <Col md={9} className="kbc-main-content">
          <Row>
            <ComponentDescription
              componentId="orchestrator"
              configId={this.state.orchestration.get('id').toString()}
            />
          </Row>
          {this.state.graphJobs.size >= 2 && (
            <div className="kbc-row">
              <h2>Jobs Graph</h2>
              <JobsGraph jobs={this.state.graphJobs}/>
            </div>
          )}
          <div className="kbc-row">
            <Row>
              <Col xs={9}>
                <h2>Tasks</h2>
              </Col>
              <Col xs={3}>
                <Link
                  className="pull-right btn btn-primary"
                  to="orchestrationTasks"
                  params={{
                    orchestrationId: this.state.orchestration.get('id')
                  }}
                >
                  <span className="fa fa-edit"/> Configure Tasks
                </Link>
              </Col>
            </Row>
            <TasksSummary tasks={this.state.tasks}/>
          </div>
          <div className="kbc-row">
            <Row>
              <Col xs={9}>
                <h2>Schedule</h2>
              </Col>
              <Col xs={3}>
                <ScheduleModal
                  crontabRecord={this.state.orchestration.get('crontabRecord')}
                  orchestrationId={this.state.orchestration.get('id')}
                />
              </Col>
            </Row>
            <CronRecord crontabRecord={this.state.orchestration.get('crontabRecord')}/>
          </div>
          <div className="kbc-row">
            <Row>
              <Col xs={9}>
                <h2>Notifications</h2>
              </Col>
              <Col xs={3}>
                <Link
                  className="pull-right btn btn-primary"
                  to="orchestrationNotifications"
                  params={{
                    orchestrationId: this.state.orchestration.get('id')
                  }}
                >
                  <span className="fa fa-edit"/> Configure Notifications
                </Link>
              </Col>
            </Row>
            {this.state.orchestration.get('notifications').count() ? (
              <span>{this.state.orchestration.get('notifications').count()} notifications set</span>
            ) : (
              <span>No notifications set yet.</span>
            )}
          </div>
          <JobsTable
            jobs={this.state.jobs}
            jobsLoading={this.state.jobsLoading}
            onJobsReload={this._handleJobsReload}
          />
        </Col>
        <Col md={3} className="kbc-main-sidebar">
          <div style={{marginBottom: '12px'}}>
            <div>
              <div>Created</div>
              <div><strong><CreatedWithIcon createdTime={this.state.orchestration.get('createdTime')} /></strong></div>
            </div>
          </div>
          <div>
            <div>Assigned Token</div>
            <div>
              <strong>
                {this.state.orchestration.getIn(['token', 'description'])}
              </strong>
            </div>
          </div>
          <ul className="nav nav-stacked">
            <li>
              <OrchestrationRunButton
                orchestration={this.state.orchestration}
                notify={true}
                tasks={this.state.tasksToRun}
                key="run"
                label="Run Orchestration"
              />
            </li>
            <li>
              <OrchestrationActiveButton
                orchestration={this.state.orchestration}
                isPending={this.state.pendingActions.get('active', false)}
                mode="link"
                key="activate"
              />
            </li>
            <li>
              <OrchestrationDeleteButton
                orchestration={this.state.orchestration}
                isPending={this.state.pendingActions.get('delete', false)}
                key="delete"
                label="Move to Trash"
              />
            </li>
            <li>
              <ExternalLink href="https://help.keboola.com/orchestrator/running/">
                <i className="fa fa-question-circle fa-fw"/> Documentation
              </ExternalLink>.
            </li>
          </ul>
          <SidebarVersions
            componentId="orchestrator"
            limit={3}
          />
        </Col>
      </div>
    );
  }
});
