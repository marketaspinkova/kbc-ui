import Index from './react/pages/index/Index';
import Table from './react/pages/table/Table';

import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import storageActions from '../components/StorageActionCreators';
// import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';

import {createTablesRoute} from '../table-browser/routes';

const componentId = 'keboola.gooddata-writer';
export default {

  name: componentId,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config),
    () => storageActions.loadTables(),
    (params) => versionsActions.loadVersions(componentId, params.config)
  ],
  /* poll: {
   *   interval: 7,
   *   action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config)
   * }, */
  childRoutes: [
    createTablesRoute(componentId),
    {
      name: componentId + '-table',
      path: 'table/:tableId',
      defaultRouteHandler: Table
    }
  ]
};
