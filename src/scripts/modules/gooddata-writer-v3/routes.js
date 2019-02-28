import Index from './react/pages/index/Index';
import Table from './react/pages/table/Table';

import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';

import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';

import {createTablesRoute} from '../table-browser/routes';

const componentId = 'keboola.gooddata-writer';

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  title: (routerState) => {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(componentId, configId).get('name');
  },
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config),
    () => storageActions.loadTables(),
    (params) => versionsActions.loadVersions(componentId, params.config)
  ],
  poll: {
    interval: 15,
    action: (params) => {
      jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
      versionsActions.reloadVersions(componentId, params.config);
    }
  },
  childRoutes: [
    {
      name: componentId + '-table',
      path: 'table/:table',
      defaultRouteHandler: Table,
      title: (routerState) => routerState.getIn(['params', 'table']),
      childRoutes: [ createTablesRoute(componentId)]
    }
  ]
};
