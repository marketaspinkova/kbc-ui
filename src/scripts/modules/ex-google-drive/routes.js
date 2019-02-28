import Index from './react/Index/Index';
import jobsActionCreators from '../jobs/ActionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import * as oauthUtils from '../oauth-v2/OauthUtils';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import storageActions from '../components/StorageActionCreators';
import {createTablesRoute} from '../table-browser/routes';

const COMPONENT_ID = 'keboola.ex-google-drive';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  title: (routerState) => {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(COMPONENT_ID, configId).get('name');
  },
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config).then(() => {
      return oauthUtils.loadCredentialsFromConfig(COMPONENT_ID, params.config);
    }),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config),
    () => storageActions.loadTables()
  ],
  poll: {
    interval: 15,
    action: (params) => {
      jobsActionCreators.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config);
      versionsActions.reloadVersions(COMPONENT_ID, params.config);
    }
  },
  childRoutes: [
    createTablesRoute(COMPONENT_ID),
    oauthUtils.createRedirectRouteSimple(COMPONENT_ID)
  ]
};
