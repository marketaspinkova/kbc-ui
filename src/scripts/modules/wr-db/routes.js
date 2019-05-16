import VersionsActionCreators from '../components/VersionsActionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import storageActionCreators from '../components/StorageActionCreators';
import JobsActionCreators from '../jobs/ActionCreators';
import {createTablesRoute} from '../table-browser/routes';

// OLD WR DB MODULES and stuff
import dbwrIndex from './react/pages/index/Index';
import dbWrTableDetail from './react/pages/table/Table';
import dbWrCredentialsDetail from './react/pages/credentials/Credentials';
import dbWrActionCreators from './actionCreators';
import dbWrCredentialsHeader from './react/components/CredentialsHeaderButtons';
import dbWrDockerProxyApi from './templates/dockerProxyApi';

export default function(componentId, driver, isProvisioning) {
  const dbWrdockerProxyActions = dbWrDockerProxyApi(componentId);
  return {
    name: componentId,
    path: ':config',
    title: (routerState) => {
      var configId;
      configId = routerState.getIn(['params', 'config']);
      return InstalledComponentsStore.getConfig(componentId, configId).get('name');
    },
    isComponent: true,
    poll: {
      interval: 15,
      action: (params) => {
        JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
        VersionsActionCreators.reloadVersions(componentId, params.config);
      }
    },
    defaultRouteHandler: dbwrIndex(componentId),
    requireData: [
      (params) => {
        const prepareWriterDataFn = () => dbWrActionCreators.loadConfiguration(componentId, params.config);
        const dockerPromise = !!dbWrdockerProxyActions && dbWrdockerProxyActions.loadConfigData(params.config);
        if (dockerPromise) {
          return dockerPromise.then(prepareWriterDataFn);
        } else {
          return prepareWriterDataFn();
        }
      },
      () => storageActionCreators.loadTables(),
      params => VersionsActionCreators.loadVersions(componentId, params.config)
    ],
    childRoutes: [
      createTablesRoute(componentId),
      {
        name: componentId + '-table',
        path: 'table/:tableId',
        handler: dbWrTableDetail(componentId),
        title: function(routerState) {
          var tableId;
          tableId = routerState.getIn(['params', 'tableId']);
          return tableId;
        },
        requireData: [
          function(params) {
            return dbWrActionCreators.loadTableConfig(componentId, params.config, params.tableId);
          }
        ]
      },
      {
        name: componentId + '-credentials',
        path: 'credentials',
        handler: dbWrCredentialsDetail(componentId, driver, isProvisioning),
        headerButtonsHandler: dbWrCredentialsHeader(componentId, driver, isProvisioning),
        title: () => 'Credentials'
      }
    ]
  };
}
