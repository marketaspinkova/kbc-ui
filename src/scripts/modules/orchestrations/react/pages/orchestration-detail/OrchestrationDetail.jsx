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
import Finished from '../../../../../react/common/Finished';
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
      tasks,
      isLoading: OrchestrationStore.getIsOrchestrationLoading(orchestrationId),
      filteredOrchestrations: OrchestrationStore.getFiltered(),
      filter: OrchestrationStore.getFilter(),
      jobs,
      versions,
      graphJobs: jobs.filter(job => job.get('startTime') && job.get('endTime')),
      jobsLoading: OrchestrationJobsStore.isLoading(orchestrationId),
      pendingActions: OrchestrationStore.getPendingActions(),
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

  _renderLastUpdate() {
    const lastVersion = this.state.versions.first();

    if (!lastVersion.get('version')) {
      return 'unknown';
    } else {
      return (
        <span>
          {lastVersion.getIn(['changeDescription'], '')}
          <small className="text-muted">
            {' '}
            {`#${lastVersion.get('version')}`} <CreatedWithIcon createdTime={lastVersion.get('created')} />
          </small>
          <br />
          {lastVersion.getIn(['creatorToken', 'description'], 'unknown')}
          <br />
          <Link
            to="orchestrator-versions"
            params={{
              orchestrationId: this.state.orchestration.get('id')
            }}
          >
            Show all versions
          </Link>
        </span>
      );
    }
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="row">
            <ComponentDescription
              componentId="orchestrator"
              configId={this.state.orchestration.get('id').toString()}
            />
          </div>
          {this.state.graphJobs.size >= 2 &&
          <div className="kbc-row">
            <h2>Jobs Graph</h2>
            <JobsGraph jobs={this.state.graphJobs}/>
          </div>
          }
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
            <Row>
              <Col xs={12}>
                <TasksSummary tasks={this.state.tasks}/>
              </Col>
            </Row>
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
            <Row>
              <Col xs={12}>
                <CronRecord crontabRecord={this.state.orchestration.get('crontabRecord')}/>
              </Col>
            </Row>
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
            <Row>
              <Col xs={12}>
                {this.state.orchestration.get('notifications').count() ? (
                  <span>{this.state.orchestration.get('notifications').count()} notifications set</span>
                ) : (
                  <span>No notifications set yet.</span>
                )}
              </Col>
            </Row>
          </div>
          <JobsTable
            jobs={this.state.jobs}
            jobsLoading={this.state.jobsLoading}
            onJobsReload={this._handleJobsReload}
          />
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div style={{marginBottom: '12px'}}>
            <div>
              <div>Created</div>
              <div><strong><Finished endTime={this.state.orchestration.get('createdTime')}/></strong></div>
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
                key="run"
                label="Run Orchestration"
              />
            </li>
            <li>
              <OrchestrationDeleteButton
                orchestration={this.state.orchestration}
                isPending={this.state.pendingActions.get('delete', false)}
                key="delete"
                label="Delete Orchestration"
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
              <ExternalLink href="https://help.keboola.com/orchestrator/running/">
                <i className="fa fa-question-circle fa-fw" /> Documentation
              </ExternalLink>.
            </li>
          </ul>
          <SidebarVersions
            componentId="orchestrator"
            limit={3}
          />
        </div>
      </div>
    );
  }
});
