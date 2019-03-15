import React from 'react';
import createReactClass from 'create-react-class';
import { fromJS, List } from 'immutable';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

// actions and stores
import ActionCreators from '../../../ActionCreators';
const { dephaseTasks, rephaseTasks, loadOrchestrationJobs } = ActionCreators;
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import OrchestrationJobsStore from '../../../stores/OrchestrationJobsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';

import mergeTasksWithConfigurations from '../../../mergeTasksWithConfigruations';

// components
import JobsNav from './JobsNav';
import JobOverview from './Overview';
import Events from '../../../../sapi-events/react/Events';
import { Tabs, Tab } from 'react-bootstrap';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationStore, OrchestrationJobsStore, InstalledComponentsStore)],

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const jobId = RoutesStore.getCurrentRouteIntParam('jobId');
    let job = OrchestrationJobsStore.getJob(jobId);
    if (job.hasIn(['results', 'tasks'])) {
      const phasedTasks = rephaseTasks(job.getIn(['results', 'tasks'], List()).toJS());
      const merged = mergeTasksWithConfigurations(fromJS(phasedTasks), InstalledComponentsStore.getAll());

      job = job.setIn(['results', 'tasks'], dephaseTasks(merged));
    }

    return {
      orchestrationId,
      job,
      isLoading: OrchestrationJobsStore.isJobLoading(jobId),
      jobs: OrchestrationJobsStore.getOrchestrationJobs(orchestrationId),
      jobsLoading: OrchestrationJobsStore.isLoading(orchestrationId),
      openedTab: RoutesStore.getRouterState().hasIn(['query', 'eventId']) ? 'log' : 'overview'
    };
  },

  componentDidMount() {
    return loadOrchestrationJobs(this.state.job.get('orchestrationId'));
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
    return loadOrchestrationJobs(this.state.job.get('orchestrationId'));
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="row kbc-row-orchestration-detail">
            <div className="col-md-3 kb-orchestrations-sidebar kbc-main-nav">
              <div className="kbc-container">
                <JobsNav jobs={this.state.jobs} activeJobId={this.state.job.get('id')} />
              </div>
            </div>
            <div className="col-md-9 kbc-main-content-with-nav">
              <div>
                <Tabs defaultActiveKey={this.state.openedTab} animation={false} id="orchestration-job-detail-tabs">
                  <Tab eventKey="overview" title="Overview" className="tab-pane-no-padding">
                    <JobOverview job={this.state.job} />
                  </Tab>
                  <Tab eventKey="log" title="Log" className="tab-pane-no-padding orchestration-job-detail-tabs">
                    <Events
                      link={{
                        to: 'orchestrationJob',
                        params: {
                          orchestrationId: this.state.orchestrationId,
                          jobId: this.state.job.get('id')
                        }
                      }}
                      params={{
                        runId: this.state.job.get('runId')
                      }}
                      autoReload={
                        this.state.job.get('status') === 'waiting' || this.state.job.get('status') === 'processing'
                      }
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
