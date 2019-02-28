import Index from './react/pages/Index/Index';
import storageActions from '../components/StorageActionCreators';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import jobsActions from '../jobs/ActionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import {createTablesRoute} from '../table-browser/routes';

const COMPONENT_ID = 'keboola.ex-s3';

export default {
  name: COMPONENT_ID,
  path: ':config',
  title: (routerState) => {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(COMPONENT_ID, configId).get('name');
  },
  isComponent: true,
  defaultRouteHandler: Index,
  poll: {
    interval: 15,
    action: (params) => {
      jobsActions.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config);
      versionsActions.reloadVersions(COMPONENT_ID, params.config);
    }
  },
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config),
    () => storageActions.loadTables(),
    () => storageActions.loadBuckets()
  ],
  childRoutes: [ createTablesRoute(COMPONENT_ID)]
};