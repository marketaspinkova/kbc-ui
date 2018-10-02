// common wr-db-{generic} modules
import VersionsActionCreators from '../components/VersionsActionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import storageActionCreators from '../components/StorageActionCreators';
import JobsActionCreators from '../jobs/ActionCreators';
import {createTablesRoute} from '../table-browser/routes';
import ApplicationStore from '../../stores/ApplicationStore';

// OLD WR DB MODULES and stuff
import dbwrIndex from '../wr-db/react/pages/index/Index';
import dbWrTableDetail from '../wr-db/react/pages/table/Table';
import dbWrCredentialsDetail from '../wr-db/react/pages/credentials/Credentials';
import dbWrActionCreators from '../wr-db/actionCreators';
import dbWrCredentialsHeader from '../wr-db/react/components/CredentialsHeaderButtons';
import dbWrDockerProxyApi from '../wr-db/templates/dockerProxyApi';

// NEW WR DB MODULES and stuff
import React from 'react';
import genericIndex from './react/Index/Index';
import genericTable from './react/Table/Table';
import genericCredentials from './react/Creadentials/Credentials';

const GENERIC_WR_DB_FEATURE = 'ui-wr-db-generic';
const hasWrDbGenericFeature = () => ApplicationStore.hasCurrentAdminFeature(GENERIC_WR_DB_FEATURE);

const createProxyRouteHandler = (oldWrDbHandler, newWrDbHandler) => {
  return (props) => {
    let handler = oldWrDbHandler;
    if (hasWrDbGenericFeature()) {
      handler = newWrDbHandler;
    }
    if (handler) {
      return React.createElement(handler, props);
    } else {
      return <span/>;
    }
  };
};

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
      interval: 5,
      action: params => JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config)
    },
    defaultRouteHandler: createProxyRouteHandler(dbwrIndex(componentId), genericIndex(componentId)),
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
        handler: createProxyRouteHandler(dbWrTableDetail(componentId), genericTable(componentId)),
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
        handler: createProxyRouteHandler(dbWrCredentialsDetail(componentId, driver, isProvisioning), genericCredentials(componentId)),
        headerButtonsHandler: createProxyRouteHandler(dbWrCredentialsHeader(componentId, driver, isProvisioning), null),
        title: () => 'Credentials'
      }
    ]
  };
}
