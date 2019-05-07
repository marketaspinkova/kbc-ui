import Index from './react/pages/Index/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import * as oauthUtils from '../oauth-v2/OauthUtils';

const COMPONENT_ID = 'keboola.wr-google-drive';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index(COMPONENT_ID),
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config).then(() => {
      return oauthUtils.loadCredentialsFromConfig(COMPONENT_ID, params.config);
    }),
    () => storageActions.loadTables(),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config)
  ],
  poll: {
    interval: 5,
    action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config)
  }
};
