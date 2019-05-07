import React from 'react';


import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import * as actionsProvisioning from './actionsProvisioning';
import ExDbIndex from './react/pages/index/Index';
import ExDbCredentialsPage from './react/pages/credentials/CredentialsPage';
import ExDbQueryDetail from './react/pages/query-detail/QueryDetail';
import ExDbQueryHeaderButtons from './react/components/QueryActionButtons';
import ExDbQueryName from './react/components/QueryName';
import JobsActionCreators from '../jobs/ActionCreators';
import StorageActionCreators from '../components/StorageActionCreators';
import VersionsActionsCreators from '../components/VersionsActionCreators';
import * as storeProvisioning from './storeProvisioning';
import * as credentialsTemplate from './credentials';

import { COMPONENT_ID } from './constants';

const componentId = COMPONENT_ID;

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  requireData: [
    function(params) {
      return actionsProvisioning.loadConfiguration(componentId, params.config);
    }, function(params) {
      return VersionsActionsCreators.loadVersions(componentId, params.config);
    }
  ],
  title: function(routerState) {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(componentId, configId).get('name');
  },
  poll: {
    interval: 5,
    action: function(params) {
      return JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
    }
  },
  defaultRouteHandler: ExDbIndex(componentId),
  childRoutes: [
    {
      name: 'ex-mongodb-query',
      path: 'query/:query',
      title: function(routerState) {
        const configId = routerState.getIn(['params', 'config']);
        const queryId = routerState.getIn(['params', 'query']);
        const ExDbStore = storeProvisioning.createStore(componentId, configId);
        return 'Query ' + ExDbStore.getConfigQuery(parseInt(queryId, 10)).get('name');
      },
      nameEdit: function(params) {
        const EditComponent = ExDbQueryName(storeProvisioning);
        return <EditComponent configId={params.config} queryId={parseInt(params.query, 10)} />;
      },
      requireData: [
        function() {
          return StorageActionCreators.loadTables();
        }
      ],
      defaultRouteHandler: ExDbQueryDetail(componentId, actionsProvisioning, storeProvisioning),
      headerButtonsHandler: ExDbQueryHeaderButtons(componentId, actionsProvisioning, storeProvisioning, 'Export')
    },
    {
      name: 'ex-mongodb-credentials',
      path: 'credentials',
      title: function() {
        return 'Credentials';
      },
      handler: ExDbCredentialsPage(componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, true)
    }
  ]
};
