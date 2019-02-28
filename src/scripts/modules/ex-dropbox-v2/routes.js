import Index from './react/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import {createTablesRoute} from '../table-browser/routes';

const COMPONENT_ID = 'radektomasek.ex-dropbox-v2';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config)
  ],
  poll: {
    interval: 15,
    action: (params) => {
      jobsActionCreators.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config);
      versionsActions.reloadVersions(COMPONENT_ID, params.config);
    }
  },
  defaultRouteHandler: Index,
  childRoutes: [ createTablesRoute(COMPONENT_ID)]
};
