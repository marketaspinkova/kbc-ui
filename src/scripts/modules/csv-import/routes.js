import Index from './react/Index/Index';
import storageActions from '../components/StorageActionCreators';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import {createTablesRoute} from '../table-browser/routes';

const COMPONENT_ID = 'keboola.csv-import';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config),
    () => storageActions.loadTables(),
    () => storageActions.loadBuckets()
  ],
  poll: {
    interval: 15,
    action: (params) => {
      versionsActions.reloadVersions(COMPONENT_ID, params.config);
    }
  },
  childRoutes: [ createTablesRoute(COMPONENT_ID)]
};
