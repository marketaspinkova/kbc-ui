import Index from './react/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import * as OauthUtils from '../oauth-v2/OauthUtils';
import versionsActions from '../components/VersionsActionCreators';

const COMPONENT_ID = 'keboola.ex-twitter';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  requireData: [
    (params) => {
      return installedComponentsActions
        .loadComponentConfigData(COMPONENT_ID, params.config)
        .then(() => {
          return OauthUtils.loadCredentialsFromConfig(COMPONENT_ID, params.config);
        });
    },
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
  childRoutes: [
    OauthUtils.createRedirectRoute(
      COMPONENT_ID + '-oauth-redirect',
      COMPONENT_ID,
      (params) => {
        return {
          component: COMPONENT_ID,
          config: params.config
        };
      },
      COMPONENT_ID
    )
  ]
};
