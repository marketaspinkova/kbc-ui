/*
  Orchestrations module routing
*/
import React from 'react';


// pages and components
import OrchestrationsIndex from './react/pages/orchestrations-index/OrchestrationsIndex';
import OrchestrationDetail from './react/pages/orchestration-detail/OrchestrationDetail';
import OrchestrationJobDetail from './react/pages/orchestration-job-detail/OrchestrationJobDetail';
import OrchestrationTasks from './react/pages/orchestration-tasks/OrchestrationTasks';
import OrchestrationNotifications from './react/pages/orchestration-notifications/OrchestrationNotifications';

import OrchestrationsReloaderButton from './react/components/OrchestrationsReloaderButton';
import NewOrchestrationHeaderButton from './react/components/NewOrchestionHeaderButton';
import OrchestrationReloaderButton from './react/components/OrchestrationReloaderButton';
import JobReloaderButton from './react/components/JobReloaderButton';
import JobDetailButtons from './react/components/JobDetailButtons';
import OrchestrationTasksButtons from './react/components/OrchestrationTasksButtons';
import OrchestrationNameEdit from './react/components/OrchestrationNameEdit';

// stores
import OrchestrationsStore from './stores/OrchestrationsStore';
import OrchestrationsActionCreators from './ActionCreators';
import InstalledComponentsActionsCreators from '../components/InstalledComponentsActionCreators';
import VersionsActionCreators from '../components/VersionsActionCreators';

import createVersionsPageRoute from '../../modules/components/utils/createVersionsPageRoute';
import StorageActionCreators from '../components/StorageActionCreators';

const routes = {
  name: 'orchestrations',
  title: 'Orchestrations',
  defaultRouteHandler: OrchestrationsIndex,
  reloaderHandler: OrchestrationsReloaderButton,
  headerButtonsHandler: NewOrchestrationHeaderButton,
  poll: {
    interval: 10,
    action() {
      OrchestrationsActionCreators.loadOrchestrationsForce();
    }
  },
  requireData: [
    () => OrchestrationsActionCreators.loadOrchestrations(),
    () => InstalledComponentsActionsCreators.loadComponents()
  ],
  childRoutes: [
    {
      name: 'orchestration',
      nameEdit(params) {
        return <OrchestrationNameEdit orchestrationId={parseInt(params.orchestrationId, 10)} />;
      },
      path: ':orchestrationId',
      reloaderHandler: OrchestrationReloaderButton,
      defaultRouteHandler: OrchestrationDetail,
      poll: {
        interval: 15,
        action: (params) => {
          OrchestrationsActionCreators.loadOrchestrationJobsForce(parseInt(params.orchestrationId, 10));
          VersionsActionCreators.reloadVersions('orchestrator', params.orchestrationId);
        }
      },
      requireData: [
        params => OrchestrationsActionCreators.loadOrchestration(parseInt(params.orchestrationId, 10)),
        params => OrchestrationsActionCreators.loadOrchestrationJobs(parseInt(params.orchestrationId, 10)),
        params => VersionsActionCreators.loadVersions('orchestrator', params.orchestrationId),
        params => OrchestrationsActionCreators.loadTriggers(params.orchestrationId),
        () => StorageActionCreators.loadTables()
      ],
      title(routerState) {
        const orchestrationId = parseInt(routerState.getIn(['params', 'orchestrationId']), 10);
        return OrchestrationsStore.get(orchestrationId).get('name');
      },

      childRoutes: [
        {
          name: 'orchestrationJob',
          reloaderHandler: JobReloaderButton,
          poll: {
            interval: 10,
            action(params) {
              return OrchestrationsActionCreators.loadJobForce(parseInt(params.jobId, 10));
            }
          },
          requireData(params) {
            return OrchestrationsActionCreators.loadJob(parseInt(params.jobId, 10));
          },
          title(routerState) {
            return `Job ${routerState.getIn(['params', 'jobId'])}`;
          },
          path: 'jobs/:jobId',
          handler: OrchestrationJobDetail,
          headerButtonsHandler: JobDetailButtons
        },
        {
          name: 'orchestrationTasks',
          title: 'Tasks',
          path: 'tasks',
          handler: OrchestrationTasks,
          headerButtonsHandler: OrchestrationTasksButtons
        },
        {
          name: 'orchestrationNotifications',
          title: 'Notifications',
          path: 'notifications',
          handler: OrchestrationNotifications
        },
        createVersionsPageRoute('orchestrator', 'orchestrationId', null, { readOnlyMode: true })
      ]
    }
  ]
};

export default routes;
