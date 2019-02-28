import Index from './react/Index/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
// import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import {createTablesRoute} from '../table-browser/routes';

const componentId = 'apify.apify';

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config),
    (params) => versionsActions.loadVersions(componentId, params.config)
  ],
  poll: {
    interval: 15,
    action: (params) => {
      jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
      versionsActions.reloadVersions(componentId, params.config);
    }
  },
  childRoutes: [ createTablesRoute(componentId)]
};
