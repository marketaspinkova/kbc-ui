import Index from './react/Index/Index';
import QueryDetail from './react/QueryDetail/QueryDetail';
import NewQuery from './react/NewQuery/NewQuery';
import * as oauthUtils from '../oauth-v2/OauthUtils';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import QueryDetailHeaderButtons from './react/QueryDetail/HeaderButtons';
import NewQueryHeaderButtons from './react/NewQuery/HeaderButtons';
import storageActions from '../components/StorageActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';

import store from './storeProvisioning';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';

export default function(componentId) {
  return {
    name: componentId,
    path: ':config',
    isComponent: true,
    defaultRouteHandler: Index(componentId),

    title: (routerState) => {
      const configId = routerState.getIn(['params', 'config']);
      return InstalledComponentsStore.getConfig(componentId, configId).get('name');
    },

    requireData: [
      (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config).then(() => {
        return oauthUtils.loadCredentialsFromConfig(componentId, params.config);
      }),
      (params) => versionsActions.loadVersions(componentId, params.config),
      () => storageActions.loadTables()
    ],
    poll: {
      interval: 7,
      action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config)
    },

    childRoutes: [
      oauthUtils.createRedirectRouteSimple(componentId),
      {
        name: componentId + '-query-detail',
        path: 'query/:queryId',
        defaultRouteHandler: QueryDetail(componentId),
        headerButtonsHandler: QueryDetailHeaderButtons(componentId),
        title: (routerState) => {
          const configId = routerState.getIn(['params', 'config']);
          const queryId = routerState.getIn(['params', 'queryId']);
          return store(configId, componentId).getConfigQuery(queryId).get('name');
        }
      },
      {
        name: componentId + '-new-query',
        path: 'new-query',
        handler: NewQuery(componentId),
        headerButtonsHandler: NewQueryHeaderButtons(componentId),
        title: () => 'New Query'
      }
    ]
  };
}
