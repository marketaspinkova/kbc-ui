import Index from './react/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import HeaderButtons from './react/HeaderButtons';
import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import {createTablesRoute} from '../table-browser/routes';

const componentId = 'geneea-nlp-analysis';

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  headerButtonsHandler: HeaderButtons,
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
  childRoutes: [ createTablesRoute(componentId)]
};
