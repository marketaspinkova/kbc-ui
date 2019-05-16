import Index from './react/Index/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import * as oauthUtils from '../oauth-v2/OauthUtils';
import {createTablesRoute} from '../table-browser/routes';

export default function(componentId) {
  return {
    name: componentId,
    path: ':config',
    isComponent: true,
    defaultRouteHandler: Index(componentId),
    requireData: [
      (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config).then(() => {
        return oauthUtils.loadCredentialsFromConfig(componentId, params.config);
      }),
      () => storageActions.loadTables(),
      (params) => versionsActions.loadVersions(componentId, params.config)
    ],
    poll: {
      interval: 15,
      action: (params) => {
        jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
        versionsActions.reloadVersions(componentId, params.config)
      }
    },
    childRoutes: [createTablesRoute(componentId)]
  };
}
