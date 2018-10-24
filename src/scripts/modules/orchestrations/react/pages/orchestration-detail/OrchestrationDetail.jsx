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
import OrchestrationsNav from './OrchestrationsNav';
import JobsTable from './JobsTable';
import JobsGraph from './JobsGraph';
import { Link } from 'react-router';
import TasksSummary from './TasksSummary';
import CronRecord from '../../components/CronRecord';
import ScheduleModal from '../../modals/Schedule';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import { SearchBar } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore, OrchestrationJobsStore, VersionsStore)],

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
      jobsLoading: OrchestrationJobsStore.isLoading(orchestrationId)
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
        <div className="kbc-main-content">
          <div className="row kbc-row-orchestration-detail">
            <div className="col-md-3 kb-orchestrations-sidebar kbc-main-nav">
              <div className="kbc-container">
                <div className="layout-master-detail-search">
                  <SearchBar onChange={this._handleFilterChange} query={this.state.filter} />
                </div>
                <OrchestrationsNav
                  orchestrations={this.state.filteredOrchestrations}
                  activeOrchestrationId={this.state.orchestration.get('id')}
                />
              </div>
            </div>
            <div className="col-md-9 kb-orchestrations-main kbc-main-content-with-nav">
              <div className="row kbc-header">
                <ComponentDescription
                  componentId="orchestrator"
                  configId={this.state.orchestration.get('id').toString()}
                />
              </div>
              <div className="table kbc-table-border-vertical kbc-detail-table">
                <div className="tr">
                  <div className="td">
                    <div className="row">
                      <div className="col-lg-3 kbc-orchestration-detail-label">{'Schedule '}</div>
                      <div className="col-lg-9">
                        <CronRecord crontabRecord={this.state.orchestration.get('crontabRecord')} />
                        <br />
                        <ScheduleModal
                          crontabRecord={this.state.orchestration.get('crontabRecord')}
                          orchestrationId={this.state.orchestration.get('id')}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3 kbc-orchestration-detail-label">Assigned Token</div>
                      <div className="col-lg-9">{this.state.orchestration.getIn(['token', 'description'])}</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3 kbc-orchestration-detail-label">Updates</div>
                      <div className="col-lg-9">{this._renderLastUpdate()}</div>
                    </div>
                  </div>
                  <div className="td">
                    <div className="row">
                      <div className="col-lg-3 kbc-orchestration-detail-label">{'Notifications '}</div>
                      <div className="col-lg-9">
                        {this.state.orchestration.get('notifications').count() ? (
                          <span className="badge">{this.state.orchestration.get('notifications').count()}</span>
                        ) : (
                          <span>No notifications set yet</span>
                        )}
                        <br />
                        <Link
                          to="orchestrationNotifications"
                          params={{
                            orchestrationId: this.state.orchestration.get('id')
                          }}
                        >
                          {' '}
                          <span className="fa fa-edit" />
                          {' Configure Notifications'}
                        </Link>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3 kbc-orchestration-detail-label">{'Tasks '}</div>
                      <div className="col-lg-9">
                        <TasksSummary tasks={this.state.tasks} />
                        <br />
                        <Link
                          to="orchestrationTasks"
                          params={{
                            orchestrationId: this.state.orchestration.get('id')
                          }}
                        >
                          {' '}
                          <span className="fa fa-edit" />
                          {' Configure Tasks'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.state.graphJobs.size >= 2 && <JobsGraph jobs={this.state.graphJobs} />}
              <JobsTable
                jobs={this.state.jobs}
                jobsLoading={this.state.jobsLoading}
                onJobsReload={this._handleJobsReload}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
});